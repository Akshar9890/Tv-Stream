import React, { useState, useEffect } from 'react';
import { 
  X, 
  Play, 
  Plus, 
  Check, 
  Star, 
  Tv,
  Download,
  Loader2,
  PlusCircle,
  Trash2
} from 'lucide-react';
import { ContentItem } from '../../types';
import { useApp } from '../../context/AppContext';
import { downloadMovieFile, isMovieDownloaded } from '../downloads/DownloadManager';

interface TitleDetailModalProps {
  item: ContentItem;
  onClose: () => void;
  onPlay: (item: ContentItem, episodeId?: string) => void;
}

export const TitleDetailModal: React.FC<TitleDetailModalProps> = ({ item, onClose, onPlay }) => {
  const { 
    watchlist, 
    toggleWatchlist, 
    getResumeProgress,
    setShowUploadModal,
    setPreselectedSeriesId,
    deleteContent,
    deleteEpisode
  } = useApp();

  const inWatchlist = watchlist.includes(item.id);
  const resumeItem = getResumeProgress(item.id);

  // Download state
  const [downloaded, setDownloaded] = useState<boolean>(false);
  const [downloading, setDownloading] = useState<boolean>(false);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);

  useEffect(() => {
    setDownloaded(isMovieDownloaded(item.id));
  }, [item.id]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleDownload = async () => {
    if (downloading) return;
    setDownloading(true);
    setDownloadProgress(0);

    try {
      await downloadMovieFile(item, '1080p', (pct) => setDownloadProgress(pct));
      setDownloaded(true);
    } catch {
      // ignore
    } finally {
      setDownloading(false);
    }
  };

  const handleDeleteTitle = async () => {
    const isSeries = item.type === 'series';
    const confirmMsg = `Are you sure you want to permanently delete "${item.title}" ${isSeries ? 'and all its episodes' : ''} from your StreamFlix home library?`;
    if (window.confirm(confirmMsg)) {
      await deleteContent(item.id);
      onClose();
    }
  };

  // Selected season for series - safely default to first available season number
  const initialSeasonNumber = (item.seasons && item.seasons.length > 0)
    ? item.seasons[0].seasonNumber 
    : 1;

  const [selectedSeasonNumber, setSelectedSeasonNumber] = useState<number>(initialSeasonNumber);

  const selectedSeason = item.seasons?.find(s => s.seasonNumber === selectedSeasonNumber) || item.seasons?.[0];

  const primaryStreamUrl = (item.type === 'series' && item.seasons?.[0]?.episodes?.[0]?.streamUrl)
    ? item.seasons[0].episodes[0].streamUrl
    : item.streamManifestUrl;
  const fullStreamUrl = typeof window !== 'undefined'
    ? (primaryStreamUrl.startsWith('http') ? primaryStreamUrl : `${window.location.origin}${primaryStreamUrl}`)
    : primaryStreamUrl;
  const vlcUrl = `vlc://${fullStreamUrl.replace(/^https?:\/\//, '')}`;

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const hours = Math.floor(mins / 60);
    if (hours > 0) {
      return `${hours}h ${mins % 60}m`;
    }
    return `${mins}m`;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div
      role="dialog"
      aria-label={`${item.title} Details`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9500,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(20px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px'
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '920px',
          maxHeight: '90vh',
          backgroundColor: '#181818',
          borderRadius: '10px',
          overflowY: 'auto',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 24px 70px rgba(0, 0, 0, 0.95)'
        }}
        className="slide-up"
      >
        {/* Prominent High-Contrast Close Button */}
        <button
          onClick={onClose}
          className="tv-focusable"
          data-tv-focus="true"
          title="Close (Esc)"
          aria-label="Close"
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            zIndex: 30,
            borderRadius: '50%',
            width: '42px',
            height: '42px',
            backgroundColor: 'rgba(24, 24, 24, 0.95)',
            border: '2px solid rgba(255, 255, 255, 0.6)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.8)'
          }}
        >
          <X size={22} color="#ffffff" strokeWidth={2.5} />
        </button>

        {/* Backdrop Header */}
        <div style={{ position: 'relative', width: '100%', height: '380px' }}>
          <img
            src={item.backdropUrl}
            alt={item.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, #181818 0%, rgba(24, 24, 24, 0.5) 45%, transparent 100%)'
            }}
          />

          {/* Title and Badges overlay */}
          <div
            style={{
              position: 'absolute',
              bottom: '24px',
              left: '32px',
              right: '32px'
            }}
          >
            {/* Netflix series / film badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ 
                color: '#E50914', 
                fontWeight: 900, 
                fontSize: '20px', 
                fontFamily: "'Arial Black', sans-serif" 
              }}>
                N
              </span>
              <span style={{ 
                letterSpacing: '4px', 
                fontSize: '12px', 
                fontWeight: 800, 
                color: 'rgba(255, 255, 255, 0.85)',
                textTransform: 'uppercase'
              }}>
                {item.type === 'series' ? 'SERIES' : 'FILM'}
              </span>
            </div>

            <h2 style={{ fontSize: '36px', fontWeight: 900, lineHeight: 1.15, textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>
              {item.title}
            </h2>
          </div>
        </div>

        {/* Content Body */}
        <div style={{ padding: '0 32px 32px 32px' }}>
          {/* Metadata Row: Match %, Year, Age, Duration, HD Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px', flexWrap: 'wrap' }}>
            <span style={{ color: '#46d369', fontWeight: 800, fontSize: '15px' }}>
              98% Match
            </span>

            <span style={{ fontSize: '14px', color: '#bcbcbc' }}>
              {item.releaseYear}
            </span>

            <span style={{ 
              fontSize: '12px', 
              color: '#bcbcbc', 
              border: '1px solid rgba(255, 255, 255, 0.4)', 
              padding: '1px 6px', 
              borderRadius: '2px' 
            }}>
              {item.ageRating}
            </span>

            <span style={{ fontSize: '14px', color: '#bcbcbc' }}>
              {item.type === 'series' && item.seasons && item.seasons.length > 0 
                ? `${item.seasons.length} Season${item.seasons.length > 1 ? 's' : ''}`
                : formatDuration(item.duration)}
            </span>

            <span style={{ 
              fontSize: '11px', 
              fontWeight: 800, 
              color: '#ffffff', 
              border: '1px solid rgba(255, 255, 255, 0.6)', 
              padding: '1px 5px', 
              borderRadius: '3px' 
            }}>
              HD
            </span>

            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#f59e0b', fontSize: '13px', fontWeight: 600 }}>
              <Star size={14} fill="#f59e0b" />
              {item.rating}
            </span>
          </div>

          {/* Action CTAs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
            <button
              onClick={() => onPlay(item)}
              className="btn tv-focusable"
              data-tv-focus="true"
              style={{ 
                padding: '12px 28px', 
                fontSize: '15px',
                backgroundColor: '#ffffff',
                color: '#000000',
                fontWeight: 800,
                borderRadius: '4px',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Play size={18} fill="#000000" />
              <span>
                {resumeItem && resumeItem.progressSeconds > 10 
                  ? `Resume (${formatTime(resumeItem.progressSeconds)})` 
                  : item.type === 'series' ? 'Play Episode 1' : 'Play Movie'}
              </span>
            </button>

            {/* Direct Open in VLC for MKV Mobile/TV Playback */}
            <a
              href={vlcUrl}
              className="btn tv-focusable"
              data-tv-focus="true"
              title="Open stream in VLC Player (Recommended for MKV on mobile/TV)"
              style={{
                padding: '12px 18px',
                fontSize: '14px',
                backgroundColor: 'rgba(249, 115, 22, 0.15)',
                color: '#f97316',
                borderColor: 'rgba(249, 115, 22, 0.4)',
                borderWidth: '1px',
                borderStyle: 'solid',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                textDecoration: 'none',
                fontWeight: 700
              }}
            >
              <Tv size={16} />
              <span>Play in VLC</span>
            </a>

            <button
              onClick={() => toggleWatchlist(item.id)}
              className="btn btn-secondary tv-focusable"
              data-tv-focus="true"
              style={{ padding: '12px 20px', fontSize: '14px' }}
            >
              {inWatchlist ? <Check size={16} color="#46d369" /> : <Plus size={16} />}
              <span>{inWatchlist ? 'In Watchlist' : 'Add to Watchlist'}</span>
            </button>

            <button
              onClick={handleDownload}
              disabled={downloading}
              className="btn btn-secondary tv-focusable"
              data-tv-focus="true"
              style={{
                padding: '12px 20px',
                fontSize: '14px',
                borderColor: downloaded ? '#46d369' : undefined,
                color: downloaded ? '#46d369' : undefined
              }}
            >
              {downloading ? (
                <>
                  <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                  <span>Downloading ({downloadProgress}%)</span>
                </>
              ) : downloaded ? (
                <>
                  <Check size={16} color="#46d369" />
                  <span>Downloaded Offline</span>
                </>
              ) : (
                <>
                  <Download size={16} />
                  <span>Download Offline</span>
                </>
              )}
            </button>

            {item.type === 'series' && (
              <button
                onClick={() => {
                  setPreselectedSeriesId(item.id);
                  setShowUploadModal(true);
                  onClose();
                }}
                className="btn tv-focusable"
                data-tv-focus="true"
                style={{
                  padding: '12px 20px',
                  fontSize: '14px',
                  backgroundColor: '#E50914',
                  color: '#ffffff',
                  fontWeight: 700,
                  borderRadius: '4px',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer'
                }}
              >
                <PlusCircle size={16} />
                <span>+ Add Episode to this Series</span>
              </button>
            )}

            {/* Delete Title from Library */}
            <button
              onClick={handleDeleteTitle}
              className="btn btn-secondary tv-focusable"
              data-tv-focus="true"
              title="Delete from Library"
              style={{
                padding: '12px 18px',
                fontSize: '14px',
                color: '#ef4444',
                borderColor: 'rgba(239, 68, 68, 0.4)',
                backgroundColor: 'rgba(239, 68, 68, 0.08)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Trash2 size={16} />
              <span>Delete</span>
            </button>

            {/* Close Modal Button */}
            <button
              onClick={onClose}
              className="btn btn-secondary tv-focusable"
              data-tv-focus="true"
              title="Close details (Esc)"
              style={{
                padding: '12px 20px',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer'
              }}
            >
              <X size={16} />
              <span>Close</span>
            </button>
          </div>

          {/* Synopsis */}
          <p style={{ fontSize: '15px', lineHeight: 1.7, color: '#e5e5e5', marginBottom: '24px' }}>
            {item.synopsis}
          </p>

          {/* Cast, Director, Genres Grid */}
          <div 
            style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
              gap: '16px',
              backgroundColor: '#232323',
              padding: '16px',
              borderRadius: '6px',
              marginBottom: '24px'
            }}
          >
            <div>
              <span style={{ fontSize: '11px', color: '#808080', fontWeight: 600, textTransform: 'uppercase' }}>
                DIRECTOR / CREATOR
              </span>
              <p style={{ fontSize: '14px', fontWeight: 600, color: '#ffffff', marginTop: '2px' }}>
                {item.director}
              </p>
            </div>

            <div>
              <span style={{ fontSize: '11px', color: '#808080', fontWeight: 600, textTransform: 'uppercase' }}>
                STARRING
              </span>
              <p style={{ fontSize: '14px', fontWeight: 500, color: '#ffffff', marginTop: '2px' }}>
                {item.cast.join(', ')}
              </p>
            </div>

            <div>
              <span style={{ fontSize: '11px', color: '#808080', fontWeight: 600, textTransform: 'uppercase' }}>
                GENRES
              </span>
              <p style={{ fontSize: '14px', fontWeight: 500, color: '#ffffff', marginTop: '2px' }}>
                {item.genres.join(', ')}
              </p>
            </div>
          </div>

          {/* Home Streaming & Quality Information */}
          <div
            style={{
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backgroundColor: '#232323',
              borderRadius: '6px',
              padding: '14px 16px',
              marginBottom: '24px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Tv size={17} color="#E50914" />
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff' }}>
                StreamFlix Multi-Device Streaming
              </span>
            </div>

            <div style={{ fontSize: '13px', color: '#a3a3a3', lineHeight: 1.5 }}>
              <span>Watch on Smart TV, iPhone, Android, and Laptop via Home Wi-Fi or Local Network.</span>
            </div>
          </div>

          {/* Series Season & Episodes (If type === 'series') */}
          {item.type === 'series' && (
            <div style={{ marginTop: '28px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#ffffff' }}>Episodes</h3>
                  
                  {/* Season selector */}
                  {item.seasons && item.seasons.length > 0 && (
                    <select
                      value={selectedSeasonNumber}
                      onChange={(e) => setSelectedSeasonNumber(Number(e.target.value))}
                      style={{
                        backgroundColor: '#2b2b2b',
                        color: '#ffffff',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '4px',
                        padding: '6px 14px',
                        fontSize: '14px',
                        fontWeight: 600,
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      {item.seasons.map(s => (
                        <option key={s.seasonNumber} value={s.seasonNumber}>
                          {s.title || `Season ${s.seasonNumber}`}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Direct Add Episode button */}
                <button
                  onClick={() => {
                    setPreselectedSeriesId(item.id);
                    setShowUploadModal(true);
                    onClose();
                  }}
                  className="btn tv-focusable"
                  data-tv-focus="true"
                  title="Upload another episode file to this series"
                  style={{
                    padding: '8px 16px',
                    fontSize: '13px',
                    fontWeight: 700,
                    backgroundColor: '#E50914',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer'
                  }}
                >
                  <PlusCircle size={15} />
                  <span>+ Add Another Episode</span>
                </button>
              </div>

              {/* Episodes List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {selectedSeason?.episodes && selectedSeason.episodes.length > 0 ? (
                  selectedSeason.episodes.map(ep => (
                    <div
                      key={ep.id}
                      role="button"
                      tabIndex={0}
                      data-tv-focus="true"
                      onClick={() => onPlay(item, ep.id)}
                      className="tv-focusable"
                      style={{
                        display: 'flex',
                        gap: '16px',
                        padding: '16px',
                        borderRadius: '6px',
                        backgroundColor: '#232323',
                        cursor: 'pointer',
                        alignItems: 'center',
                        transition: 'background-color 150ms ease'
                      }}
                    >
                      {/* Big Episode Number */}
                      <span style={{ fontSize: '20px', fontWeight: 800, color: '#808080', width: '28px', textAlign: 'center' }}>
                        {ep.episodeNumber}
                      </span>

                      {/* Thumbnail */}
                      <div style={{ position: 'relative', width: '150px', height: '84px', flexShrink: 0, borderRadius: '4px', overflow: 'hidden' }}>
                        <img
                          src={ep.thumbnailUrl || item.backdropUrl}
                          alt={ep.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <div
                          style={{
                            position: 'absolute',
                            inset: 0,
                            backgroundColor: 'rgba(0, 0, 0, 0.4)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <div style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: '50%',
                            border: '2px solid #ffffff',
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <Play size={16} fill="#ffffff" style={{ marginLeft: '2px' }} />
                          </div>
                        </div>
                      </div>

                      {/* Episode Info */}
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff' }}>
                            {ep.title}
                          </h4>
                          <span style={{ fontSize: '13px', color: '#a3a3a3' }}>
                            {formatDuration(ep.duration)}
                          </span>
                        </div>
                        <p style={{ fontSize: '13px', color: '#a3a3a3', lineHeight: 1.5 }}>
                          {ep.synopsis}
                        </p>
                      </div>

                      {/* Delete Episode Action Button */}
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (window.confirm(`Delete "${ep.title}" (Episode ${ep.episodeNumber}) from this series?`)) {
                            await deleteEpisode(item.id, ep.id);
                          }
                        }}
                        title="Delete this Episode"
                        className="btn btn-ghost tv-focusable"
                        data-tv-focus="true"
                        style={{
                          padding: '8px',
                          color: '#808080',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          marginLeft: '8px'
                        }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#ef4444'; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = '#808080'; }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '24px', textAlign: 'center', color: '#a3a3a3', backgroundColor: '#232323', borderRadius: '6px' }}>
                    <p style={{ marginBottom: '12px' }}>No episodes added for this season yet.</p>
                    <button
                      onClick={() => {
                        setPreselectedSeriesId(item.id);
                        setShowUploadModal(true);
                        onClose();
                      }}
                      className="btn tv-focusable"
                      data-tv-focus="true"
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#E50914',
                        color: '#ffffff',
                        fontWeight: 700,
                        borderRadius: '4px',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      + Upload Episode 1 Now
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
