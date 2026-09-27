import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  RotateCw, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  Settings, 
  Subtitles, 
  X, 
  Lock, 
  ShieldCheck, 
  ArrowLeft,
  Download,
  Check,
  Loader2
} from 'lucide-react';
import { ContentItem } from '../../types';
import { useApp } from '../../context/AppContext';
import { downloadMovieFile, isMovieDownloaded } from '../downloads/DownloadManager';

interface VideoPlayerProps {
  content: ContentItem;
  episodeId?: string;
  onClose: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ content, episodeId, onClose }) => {
  const { 
    checkEntitlement, 
    setShowBillingModal, 
    updateWatchProgress, 
    getResumeProgress 
  } = useApp();

  const isEntitled = checkEntitlement(content.entitlementTier);

  // Video and Container Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Player UI state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(content.duration || 600);
  const [volume, setVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isBuffering, setIsBuffering] = useState<boolean>(false);
  const [controlsVisible, setControlsVisible] = useState<boolean>(true);
  const hideTimeoutRef = useRef<number | null>(null);

  // Quality & Tracks state
  const [selectedQuality, setSelectedQuality] = useState<string>('Auto (1080p)');
  const [showSettingsMenu, setShowSettingsMenu] = useState<boolean>(false);
  const [selectedAudio, setSelectedAudio] = useState<string>(content.audioTracks[0]?.id || 'en');
  const [selectedSubtitle, setSelectedSubtitle] = useState<string>('off');
  const [showSubtitleMenu, setShowSubtitleMenu] = useState<boolean>(false);

  // Download state
  const [downloaded, setDownloaded] = useState<boolean>(isMovieDownloaded(content.id));
  const [downloading, setDownloading] = useState<boolean>(false);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);

  const handleDownload = async () => {
    if (downloading) return;
    setDownloading(true);
    setDownloadProgress(0);
    try {
      await downloadMovieFile(content, '1080p', (pct) => setDownloadProgress(pct));
      setDownloaded(true);
    } catch {
      // ignore
    } finally {
      setDownloading(false);
    }
  };

  // Resume prompt state
  const previousProgress = getResumeProgress(content.id);
  const [showResumePrompt, setShowResumePrompt] = useState<boolean>(
    Boolean(previousProgress && previousProgress.progressSeconds > 15 && previousProgress.progressSeconds < (previousProgress.durationSeconds - 30))
  );

  // Stream URL selection (episode stream vs movie stream)
  const activeEpisode = content.seasons
    ?.flatMap(s => s.episodes)
    .find(e => e.id === episodeId);

  const streamSrc = activeEpisode?.streamUrl || content.streamManifestUrl;

  // Auto-hide controls timer
  const resetHideTimer = useCallback(() => {
    setControlsVisible(true);
    if (hideTimeoutRef.current) {
      window.clearTimeout(hideTimeoutRef.current);
    }
    hideTimeoutRef.current = window.setTimeout(() => {
      if (isPlaying) {
        setControlsVisible(false);
        setShowSettingsMenu(false);
        setShowSubtitleMenu(false);
      }
    }, 3500);
  }, [isPlaying]);

  // Handle Play / Pause
  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
    resetHideTimer();
  }, [resetHideTimer]);

  // Handle Skip 10s Backward / Forward
  const skip = useCallback((delta: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(0, Math.min(videoRef.current.duration || duration, videoRef.current.currentTime + delta));
    resetHideTimer();
  }, [duration, resetHideTimer]);

  // Handle Fullscreen Toggle
  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  }, []);

  // Keyboard & TV D-Pad Controls for Player
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case ' ':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          skip(-10);
          break;
        case 'ArrowRight':
          e.preventDefault();
          skip(10);
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (videoRef.current) {
            const newVol = Math.min(1, volume + 0.1);
            videoRef.current.volume = newVol;
            setVolume(newVol);
            setIsMuted(false);
          }
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (videoRef.current) {
            const newVol = Math.max(0, volume - 0.1);
            videoRef.current.volume = newVol;
            setVolume(newVol);
          }
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'm':
        case 'M':
          e.preventDefault();
          if (videoRef.current) {
            videoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
          }
          break;
        case 'Escape':
          e.preventDefault();
          if (isFullscreen) {
            document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
          } else {
            onClose();
          }
          break;
      }
      resetHideTimer();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, skip, toggleFullscreen, volume, isMuted, isFullscreen, onClose, resetHideTimer]);

  // Video event handlers
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const curr = videoRef.current.currentTime;
    setCurrentTime(curr);
    
    // Periodically sync watch history (every 5 seconds)
    if (Math.floor(curr) % 5 === 0) {
      updateWatchProgress(content.id, Math.floor(curr), Math.floor(videoRef.current.duration || duration), episodeId);
    }
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration || content.duration);
    if (!showResumePrompt) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = target;
      setCurrentTime(target);
    }
    resetHideTimer();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleResumeChoice = (resume: boolean) => {
    setShowResumePrompt(false);
    if (videoRef.current) {
      if (resume && previousProgress) {
        videoRef.current.currentTime = previousProgress.progressSeconds;
      } else {
        videoRef.current.currentTime = 0;
      }
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  // If user is not entitled to this tier, show Paywall Gate per ARCHITECTURE.md §3 & TESTING.md §4
  if (!isEntitled) {
    return (
      <div 
        role="dialog" 
        aria-label="Subscription Entitlement Required"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 10000,
          backgroundColor: 'rgba(10, 10, 15, 0.98)',
          backdropFilter: 'blur(20px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px'
        }}
      >
        <div 
          style={{
            maxWidth: '540px',
            width: '100%',
            backgroundColor: 'var(--surface)',
            border: '1px solid rgba(229, 73, 61, 0.4)',
            borderRadius: '12px',
            padding: '36px',
            textAlign: 'center',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.9), 0 0 30px rgba(229, 73, 61, 0.2)'
          }}
          className="slide-up"
        >
          <div 
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'rgba(229, 73, 61, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px auto',
              color: 'var(--accent)'
            }}
          >
            <Lock size={32} />
          </div>

          <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '8px' }}>
            Subscription Required
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px', lineHeight: 1.6 }}>
            <strong>{content.title}</strong> requires an active{' '}
            <span style={{ color: 'var(--accent)', fontWeight: 700, textTransform: 'uppercase' }}>
              {content.entitlementTier}
            </span>{' '}
            plan. Stream in up to 4K Ultra HD, Dolby Atmos audio, and enjoy ad-free unlimited entertainment.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              onClick={() => {
                onClose();
                setShowBillingModal(true);
              }}
              className="btn btn-primary tv-focusable"
              data-tv-focus="true"
              style={{ width: '100%', padding: '14px', fontSize: '16px' }}
            >
              Upgrade Plan Now
            </button>
            <button
              onClick={onClose}
              className="btn btn-secondary tv-focusable"
              data-tv-focus="true"
              style={{ width: '100%', padding: '12px' }}
            >
              Back to Catalog
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={resetHideTimer}
      onClick={resetHideTimer}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9990,
        backgroundColor: '#000000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
      }}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={streamSrc}
        playsInline
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => setIsBuffering(false)}
        onClick={togglePlay}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          backgroundColor: '#000000'
        }}
      />

      {/* Buffering Indicator */}
      {isBuffering && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none'
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              border: '4px solid rgba(255, 255, 255, 0.2)',
              borderTopColor: 'var(--accent)',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite'
            }}
          />
        </div>
      )}

      {/* Subtitle Caption Overlay */}
      {selectedSubtitle !== 'off' && (
        <div
          style={{
            position: 'absolute',
            bottom: controlsVisible ? '110px' : '40px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            color: '#ffffff',
            padding: '6px 14px',
            borderRadius: '4px',
            fontSize: '18px',
            fontWeight: 600,
            letterSpacing: '0.4px',
            pointerEvents: 'none',
            textAlign: 'center',
            transition: 'bottom 200ms ease'
          }}
        >
          [Subtitle: {content.title} — Dialog active]
        </div>
      )}

      {/* Resume Position Prompt Modal */}
      {showResumePrompt && previousProgress && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'rgba(21, 21, 31, 0.95)',
            backdropFilter: 'blur(16px)',
            border: '1px solid var(--accent)',
            borderRadius: '12px',
            padding: '28px 36px',
            textAlign: 'center',
            zIndex: 100,
            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.9)'
          }}
        >
          <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>
            Resume Playback?
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px' }}>
            You left off at <strong>{formatTime(previousProgress.progressSeconds)}</strong>.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              onClick={() => handleResumeChoice(true)}
              className="btn btn-primary tv-focusable"
              data-tv-focus="true"
              autoFocus
            >
              Resume ({formatTime(previousProgress.progressSeconds)})
            </button>
            <button
              onClick={() => handleResumeChoice(false)}
              className="btn btn-secondary tv-focusable"
              data-tv-focus="true"
            >
              Play from Beginning
            </button>
          </div>
        </div>
      )}

      {/* Top Chrome: Back button, Title & DRM Badge */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          padding: '24px 32px',
          background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.85) 0%, transparent 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          opacity: controlsVisible ? 1 : 0,
          pointerEvents: controlsVisible ? 'auto' : 'none',
          transition: 'opacity 250ms ease-in-out',
          zIndex: 50
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={onClose}
            className="btn btn-ghost tv-focusable"
            data-tv-focus="true"
            title="Exit Player"
            style={{ borderRadius: '50%', width: '42px', height: '42px', padding: 0 }}
          >
            <ArrowLeft size={22} />
          </button>

          <div>
            <h1 style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '0.2px' }}>
              {content.title} {activeEpisode && `— S${activeEpisode.seasonNumber} E${activeEpisode.episodeNumber}: ${activeEpisode.title}`}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
              <span className={`badge badge-bucket-${content.bucket}`}>
                {content.bucket === 'owned' ? 'StreamHub Original' : content.bucket === 'licensed' ? 'Licensed SVOD' : 'Creator Spotlight'}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                {content.ageRating} • {content.genres.join(', ')}
              </span>
            </div>
          </div>
        </div>

        {/* DRM Security badge */}
        <div 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px', 
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '11px',
            color: '#a3e635'
          }}
        >
          <ShieldCheck size={14} />
          <span>DRM Protected (Widevine L1)</span>
        </div>
      </div>

      {/* Bottom Controls Bar */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '24px 32px 32px 32px',
          background: 'linear-gradient(to top, rgba(0, 0, 0, 0.9) 0%, transparent 100%)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          opacity: controlsVisible ? 1 : 0,
          pointerEvents: controlsVisible ? 'auto' : 'none',
          transition: 'opacity 250ms ease-in-out',
          zIndex: 50
        }}
      >
        {/* Scrubber Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
            {formatTime(currentTime)}
          </span>

          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            style={{
              flex: 1,
              accentColor: 'var(--accent)',
              cursor: 'pointer',
              height: '6px'
            }}
          />

          <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
            {formatTime(duration)}
          </span>
        </div>

        {/* Bottom Control Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Left Controls: Play, Skip Backward, Skip Forward, Volume */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button
              onClick={togglePlay}
              className="btn btn-ghost tv-focusable"
              data-tv-focus="true"
              title={isPlaying ? "Pause (Space)" : "Play (Space)"}
              style={{ width: '42px', height: '42px', borderRadius: '50%', padding: 0 }}
            >
              {isPlaying ? <Pause size={22} /> : <Play size={22} />}
            </button>

            <button
              onClick={() => skip(-10)}
              className="btn btn-ghost tv-focusable"
              data-tv-focus="true"
              title="Skip 10s Back (Left Arrow)"
              style={{ width: '40px', height: '40px', borderRadius: '50%', padding: 0 }}
            >
              <RotateCcw size={18} />
            </button>

            <button
              onClick={() => skip(10)}
              className="btn btn-ghost tv-focusable"
              data-tv-focus="true"
              title="Skip 10s Forward (Right Arrow)"
              style={{ width: '40px', height: '40px', borderRadius: '50%', padding: 0 }}
            >
              <RotateCw size={18} />
            </button>

            {/* Volume Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '8px' }}>
              <button
                onClick={() => {
                  if (videoRef.current) {
                    videoRef.current.muted = !isMuted;
                    setIsMuted(!isMuted);
                  }
                }}
                className="btn btn-ghost tv-focusable"
                data-tv-focus="true"
                title="Mute / Unmute (M)"
                style={{ width: '38px', height: '38px', borderRadius: '50%', padding: 0 }}
              >
                {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
            </div>
          </div>

          {/* Right Controls: Subtitles, Quality Settings, Fullscreen */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative' }}>
            {/* Subtitles Track Selector */}
            <button
              onClick={() => {
                setShowSubtitleMenu(!showSubtitleMenu);
                setShowSettingsMenu(false);
              }}
              className={`btn btn-ghost tv-focusable ${selectedSubtitle !== 'off' ? 'btn-primary' : ''}`}
              data-tv-focus="true"
              title="Subtitles & Audio"
              style={{ height: '38px', padding: '0 12px', fontSize: '13px' }}
            >
              <Subtitles size={16} />
              <span>Audio/Sub</span>
            </button>

            {/* Quality Selector */}
            <button
              onClick={() => {
                setShowSettingsMenu(!showSettingsMenu);
                setShowSubtitleMenu(false);
              }}
              className="btn btn-ghost tv-focusable"
              data-tv-focus="true"
              title="Stream Quality"
              style={{ height: '38px', padding: '0 12px', fontSize: '13px' }}
            >
              <Settings size={16} />
              <span>{selectedQuality}</span>
            </button>

            {/* Download Button */}
            <button
              onClick={handleDownload}
              disabled={downloading}
              className={`btn btn-ghost tv-focusable ${downloaded ? 'text-green' : ''}`}
              data-tv-focus="true"
              title={downloaded ? "Downloaded Offline" : "Download Video"}
              style={{ 
                height: '38px', 
                padding: '0 12px', 
                fontSize: '13px',
                color: downloaded ? '#4ade80' : undefined 
              }}
            >
              {downloading ? (
                <>
                  <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                  <span>{downloadProgress}%</span>
                </>
              ) : downloaded ? (
                <>
                  <Check size={16} color="#4ade80" />
                  <span>Downloaded</span>
                </>
              ) : (
                <>
                  <Download size={16} />
                  <span>Download</span>
                </>
              )}
            </button>

            {/* Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              className="btn btn-ghost tv-focusable"
              data-tv-focus="true"
              title="Fullscreen (F)"
              style={{ width: '40px', height: '40px', borderRadius: '50%', padding: 0 }}
            >
              {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* Subtitles & Audio Tracks Flyout */}
      {showSubtitleMenu && (
        <div
          style={{
            position: 'absolute',
            bottom: '90px',
            right: '80px',
            backgroundColor: 'rgba(21, 21, 31, 0.95)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '8px',
            padding: '16px',
            minWidth: '220px',
            zIndex: 60,
            boxShadow: '0 12px 30px rgba(0, 0, 0, 0.8)'
          }}
          className="slide-up"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)' }}>AUDIO</span>
            <button onClick={() => setShowSubtitleMenu(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              <X size={14} />
            </button>
          </div>
          {content.audioTracks.map(track => (
            <button
              key={track.id}
              onClick={() => setSelectedAudio(track.id)}
              className="tv-focusable"
              data-tv-focus="true"
              style={{
                width: '100%',
                padding: '8px 10px',
                textAlign: 'left',
                background: selectedAudio === track.id ? 'var(--accent)' : 'transparent',
                color: '#ffffff',
                border: 'none',
                borderRadius: '4px',
                fontSize: '13px',
                cursor: 'pointer',
                marginBottom: '4px'
              }}
            >
              {track.label}
            </button>
          ))}

          <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', marginTop: '12px', marginBottom: '8px' }}>
            SUBTITLES
          </div>
          <button
            onClick={() => setSelectedSubtitle('off')}
            className="tv-focusable"
            data-tv-focus="true"
            style={{
              width: '100%',
              padding: '8px 10px',
              textAlign: 'left',
              background: selectedSubtitle === 'off' ? 'var(--accent)' : 'transparent',
              color: '#ffffff',
              border: 'none',
              borderRadius: '4px',
              fontSize: '13px',
              cursor: 'pointer',
              marginBottom: '4px'
            }}
          >
            Off
          </button>
          {content.subtitleTracks.map(sub => (
            <button
              key={sub.id}
              onClick={() => setSelectedSubtitle(sub.id)}
              className="tv-focusable"
              data-tv-focus="true"
              style={{
                width: '100%',
                padding: '8px 10px',
                textAlign: 'left',
                background: selectedSubtitle === sub.id ? 'var(--accent)' : 'transparent',
                color: '#ffffff',
                border: 'none',
                borderRadius: '4px',
                fontSize: '13px',
                cursor: 'pointer',
                marginBottom: '4px'
              }}
            >
              {sub.label}
            </button>
          ))}
        </div>
      )}

      {/* Quality Settings Flyout */}
      {showSettingsMenu && (
        <div
          style={{
            position: 'absolute',
            bottom: '90px',
            right: '40px',
            backgroundColor: 'rgba(21, 21, 31, 0.95)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '8px',
            padding: '16px',
            minWidth: '200px',
            zIndex: 60,
            boxShadow: '0 12px 30px rgba(0, 0, 0, 0.8)'
          }}
          className="slide-up"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)' }}>VIDEO QUALITY</span>
            <button onClick={() => setShowSettingsMenu(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              <X size={14} />
            </button>
          </div>

          <button
            onClick={() => {
              setSelectedQuality('Auto (Adaptive HLS)');
              setShowSettingsMenu(false);
            }}
            className="tv-focusable"
            data-tv-focus="true"
            style={{
              width: '100%',
              padding: '8px 10px',
              textAlign: 'left',
              background: selectedQuality.startsWith('Auto') ? 'var(--accent)' : 'transparent',
              color: '#ffffff',
              border: 'none',
              borderRadius: '4px',
              fontSize: '13px',
              cursor: 'pointer',
              marginBottom: '4px'
            }}
          >
            Auto (Adaptive HLS)
          </button>

          {content.renditions.map(rendition => (
            <button
              key={rendition.quality}
              onClick={() => {
                setSelectedQuality(`${rendition.quality} (${rendition.bitrate})`);
                setShowSettingsMenu(false);
              }}
              className="tv-focusable"
              data-tv-focus="true"
              style={{
                width: '100%',
                padding: '8px 10px',
                textAlign: 'left',
                background: selectedQuality.includes(rendition.quality) ? 'var(--accent)' : 'transparent',
                color: '#ffffff',
                border: 'none',
                borderRadius: '4px',
                fontSize: '13px',
                cursor: 'pointer',
                marginBottom: '4px'
              }}
            >
              {rendition.quality} — {rendition.resolution}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
