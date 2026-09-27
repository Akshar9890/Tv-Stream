import React, { useState, useEffect } from 'react';
import { 
  X, 
  UploadCloud, 
  CheckCircle2, 
  Play, 
  FileVideo, 
  Film, 
  Tv, 
  PlusCircle, 
  ListPlus
} from 'lucide-react';
import { ContentItem, Episode } from '../../types';
import { useApp } from '../../context/AppContext';

interface UploadRightsModalProps {
  onClose: () => void;
}

export const UploadRightsModal: React.FC<UploadRightsModalProps> = ({ onClose }) => {
  const { 
    addDirectContent, 
    setPlayingContent, 
    catalog, 
    addEpisodeToSeries, 
    preselectedSeriesId 
  } = useApp();

  const seriesList = catalog.filter(item => item.type === 'series');

  // Mode: Movie vs TV Show / Episode
  const [uploadMode, setUploadMode] = useState<'movie' | 'episode'>(
    preselectedSeriesId ? 'episode' : 'movie'
  );

  // For Episode mode: Add to existing series vs Create new series
  const [episodeAction, setEpisodeAction] = useState<'existing' | 'new'>(
    seriesList.length > 0 ? 'existing' : 'new'
  );

  const [selectedSeriesId, setSelectedSeriesId] = useState<string>(
    preselectedSeriesId || (seriesList.length > 0 ? seriesList[0].id : '')
  );

  // Common Video File
  const [videoFile, setVideoFile] = useState<File | null>(null);

  // Movie or New Series details
  const [title, setTitle] = useState<string>('');
  const [synopsis, setSynopsis] = useState<string>('');
  const [genres, setGenres] = useState<string>('Comedy, Entertainment');
  const [posterUrl, setPosterUrl] = useState<string>('https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop&q=80');

  // Episode-specific fields
  const [seasonNumber, setSeasonNumber] = useState<number>(1);
  const [episodeNumber, setEpisodeNumber] = useState<number>(1);
  const [episodeTitle, setEpisodeTitle] = useState<string>('');
  const [episodeSynopsis, setEpisodeSynopsis] = useState<string>('');

  // Upload progress state
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [submittedTitle, setSubmittedTitle] = useState<string>('');
  const [submittedItemToPlay, setSubmittedItemToPlay] = useState<{ item: ContentItem; episodeId?: string } | null>(null);

  // Auto-tune season & episode number based on selected series
  useEffect(() => {
    if (episodeAction === 'existing' && selectedSeriesId) {
      const series = seriesList.find(s => s.id === selectedSeriesId);
      if (series && series.seasons && series.seasons.length > 0) {
        const lastSeason = series.seasons[series.seasons.length - 1];
        setSeasonNumber(lastSeason.seasonNumber);
        const nextEpNum = lastSeason.episodes.length > 0 
          ? Math.max(...lastSeason.episodes.map(e => e.episodeNumber)) + 1 
          : 1;
        setEpisodeNumber(nextEpNum);
      }
    }
  }, [selectedSeriesId, episodeAction]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const cleanFilenameToTitle = (filename: string): string => {
    return filename
      .replace(/\.[^/.]+$/, '') // remove extension
      .replace(/[._-]+/g, ' ')  // replace dots, underscores, dashes with space
      .replace(/\b(1080p|720p|480p|2160p|4k|bluray|webrip|web-dl|x264|x265|hevc|h264|dvdrip|vegamovies|1vegamovies|tw)\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setVideoFile(file);
      const cleanTitle = cleanFilenameToTitle(file.name);

      if (uploadMode === 'movie' || (uploadMode === 'episode' && episodeAction === 'new')) {
        setTitle(cleanTitle || file.name);
        if (!synopsis) {
          setSynopsis(`Home media: ${cleanTitle || file.name}`);
        }
      }

      if (uploadMode === 'episode') {
        setEpisodeTitle(cleanTitle || `Episode ${episodeNumber}`);
        if (!episodeSynopsis) {
          setEpisodeSynopsis(`Season ${seasonNumber}, Episode ${episodeNumber}`);
        }
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    setUploadProgress(10);

    let streamUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

    // 1. Upload video file to /api/upload-movie
    if (videoFile) {
      try {
        const safeName = videoFile.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const uploadRes = await new Promise<{ url: string }>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open('POST', `/api/upload-movie?filename=${encodeURIComponent(safeName)}`);
          
          xhr.upload.onprogress = (evt) => {
            if (evt.lengthComputable) {
              const pct = Math.round((evt.loaded / evt.total) * 90);
              setUploadProgress(pct);
            }
          };

          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const json = JSON.parse(xhr.responseText);
                resolve(json);
              } catch {
                resolve({ url: `/uploads/${safeName}` });
              }
            } else {
              reject(new Error(`Upload failed with status ${xhr.status}`));
            }
          };

          xhr.onerror = () => reject(new Error('Network error during video upload'));
          xhr.send(videoFile);
        });

        streamUrl = uploadRes.url;
        setUploadProgress(100);
      } catch {
        streamUrl = URL.createObjectURL(videoFile);
      }
    }

    // 2. Handle Case A: Add Episode to Existing Series
    if (uploadMode === 'episode' && episodeAction === 'existing') {
      const targetSeries = seriesList.find(s => s.id === selectedSeriesId);
      if (!targetSeries) {
        alert('Please select an existing series.');
        setUploading(false);
        return;
      }

      const epId = `ep-${Date.now()}`;
      const newEpisode: Episode = {
        id: epId,
        seasonNumber: Number(seasonNumber),
        episodeNumber: Number(episodeNumber),
        title: episodeTitle.trim() || `Episode ${episodeNumber}`,
        synopsis: episodeSynopsis.trim() || `Season ${seasonNumber}, Episode ${episodeNumber}`,
        duration: 3600,
        thumbnailUrl: targetSeries.posterUrl || 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=500&auto=format&fit=crop&q=80',
        streamUrl,
        renditions: [
          { quality: '1080p', resolution: '1920x1080', bitrate: '5.0 Mbps', url: streamUrl },
          { quality: '720p', resolution: '1280x720', bitrate: '2.5 Mbps', url: streamUrl }
        ]
      };

      await addEpisodeToSeries(targetSeries.id, Number(seasonNumber), newEpisode);
      setSubmittedTitle(`${targetSeries.title} - S${seasonNumber}:E${episodeNumber} "${newEpisode.title}"`);
      setSubmittedItemToPlay({ item: targetSeries, episodeId: epId });
      setUploading(false);
      setIsSubmitted(true);
      return;
    }

    // 3. Handle Case B: Create New TV Series with Initial Episode
    if (uploadMode === 'episode' && episodeAction === 'new') {
      if (!title.trim()) {
        alert('Please enter a Series title.');
        setUploading(false);
        return;
      }

      const seriesId = `sh-series-${Date.now()}`;
      const epId = `ep-${Date.now()}`;
      const initialEpisode: Episode = {
        id: epId,
        seasonNumber: Number(seasonNumber),
        episodeNumber: Number(episodeNumber),
        title: episodeTitle.trim() || `Episode ${episodeNumber}`,
        synopsis: episodeSynopsis.trim() || `Season ${seasonNumber}, Episode ${episodeNumber}`,
        duration: 3600,
        thumbnailUrl: posterUrl,
        streamUrl,
        renditions: [
          { quality: '1080p', resolution: '1920x1080', bitrate: '5.0 Mbps', url: streamUrl }
        ]
      };

      const newSeriesItem: ContentItem = {
        id: seriesId,
        title: title.trim(),
        slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        type: 'series',
        synopsis: synopsis.trim() || `${title.trim()} Series on StreamFlix.`,
        duration: 3600,
        releaseYear: new Date().getFullYear(),
        rating: 9.0,
        ageRating: 'U/A 13+',
        genres: genres.split(',').map(g => g.trim()).filter(Boolean),
        cast: ['Home Collection'],
        director: 'Personal Upload',
        posterUrl,
        backdropUrl: 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=1600&auto=format&fit=crop&q=80',
        bucket: 'owned',
        entitlementTier: 'free',
        streamManifestUrl: streamUrl,
        renditions: [
          { quality: '1080p', resolution: '1920x1080', bitrate: '5.0 Mbps', url: streamUrl }
        ],
        audioTracks: [{ id: 'orig', label: 'Original Audio', language: 'en', isDefault: true }],
        subtitleTracks: [],
        status: 'published',
        viewCount: 0,
        seasons: [
          {
            seasonNumber: Number(seasonNumber),
            title: `Season ${seasonNumber}`,
            episodes: [initialEpisode]
          }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      try {
        await fetch('/api/upload-movie', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newSeriesItem)
        });
      } catch {
        // ignore
      }

      addDirectContent(newSeriesItem);
      setSubmittedTitle(`${newSeriesItem.title} (Season ${seasonNumber})`);
      setSubmittedItemToPlay({ item: newSeriesItem, episodeId: epId });
      setUploading(false);
      setIsSubmitted(true);
      return;
    }

    // 4. Handle Case C: Single Movie
    if (!title.trim()) {
      alert('Please enter a movie title.');
      setUploading(false);
      return;
    }

    const newId = `sh-movie-${Date.now()}`;
    const newMovieItem: ContentItem = {
      id: newId,
      title: title.trim(),
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      type: 'movie',
      synopsis: synopsis.trim() || `Added to Home StreamFlix library.`,
      duration: 5400,
      releaseYear: new Date().getFullYear(),
      rating: 8.8,
      ageRating: 'U/A 13+',
      genres: genres.split(',').map(g => g.trim()).filter(Boolean),
      cast: ['Home Collection'],
      director: 'Personal Upload',
      posterUrl,
      backdropUrl: 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=1600&auto=format&fit=crop&q=80',
      bucket: 'owned',
      entitlementTier: 'free',
      streamManifestUrl: streamUrl,
      renditions: [
        { quality: '1080p', resolution: '1920x1080', bitrate: '5.0 Mbps', url: streamUrl },
        { quality: '720p', resolution: '1280x720', bitrate: '2.5 Mbps', url: streamUrl }
      ],
      audioTracks: [{ id: 'orig', label: 'Original Audio', language: 'en', isDefault: true }],
      subtitleTracks: [],
      status: 'published',
      viewCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      await fetch('/api/upload-movie', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMovieItem)
      });
    } catch {
      // ignore
    }

    addDirectContent(newMovieItem);
    setSubmittedTitle(newMovieItem.title);
    setSubmittedItemToPlay({ item: newMovieItem });
    setUploading(false);
    setIsSubmitted(true);
  };

  const handlePlayNow = () => {
    if (submittedItemToPlay) {
      setPlayingContent({ content: submittedItemToPlay.item, episodeId: submittedItemToPlay.episodeId });
      onClose();
    }
  };

  return (
    <div
      role="dialog"
      aria-label="Upload Video or Series Episode"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9600,
        backgroundColor: 'rgba(0, 0, 0, 0.88)',
        backdropFilter: 'blur(20px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '680px',
          maxHeight: '92vh',
          backgroundColor: '#181818',
          borderRadius: '12px',
          overflowY: 'auto',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          padding: '28px',
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
            borderRadius: '50%', 
            width: '40px', 
            height: '40px',
            backgroundColor: '#262626',
            border: '2px solid rgba(255, 255, 255, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.6)'
          }}
        >
          <X size={22} color="#ffffff" strokeWidth={2.5} />
        </button>

        {isSubmitted ? (
          <div style={{ textAlign: 'center', padding: '36px 20px' }}>
            <div 
              style={{ 
                width: '64px', 
                height: '64px', 
                borderRadius: '50%', 
                backgroundColor: 'rgba(70, 211, 105, 0.15)', 
                color: '#46d369',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto'
              }}
            >
              <CheckCircle2 size={38} />
            </div>

            <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '8px', color: '#ffffff' }}>
              Added to StreamFlix Library!
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '15px', maxWidth: '480px', margin: '0 auto 24px auto', lineHeight: 1.6 }}>
              <strong>{submittedTitle}</strong> has been uploaded and added. It is immediately available on your TV, phone, and laptops.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '14px' }}>
              <button
                onClick={handlePlayNow}
                className="btn tv-focusable"
                data-tv-focus="true"
                style={{ 
                  padding: '12px 28px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  fontSize: '15px',
                  backgroundColor: '#ffffff',
                  color: '#000000',
                  fontWeight: 700,
                  borderRadius: '4px'
                }}
              >
                <Play size={18} fill="#000000" />
                <span>Play Now</span>
              </button>

              <button
                onClick={onClose}
                className="btn btn-secondary tv-focusable"
                data-tv-focus="true"
                style={{ padding: '12px 28px', fontSize: '15px' }}
              >
                Back to Library
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
              <div 
                style={{ 
                  width: '36px', 
                  height: '36px', 
                  borderRadius: '8px', 
                  backgroundColor: 'rgba(229, 9, 20, 0.15)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}
              >
                <UploadCloud size={20} color="#E50914" />
              </div>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#ffffff' }}>
                Add Video to StreamFlix
              </h2>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Upload movie files or append new episodes to an existing series to stream across all devices.
            </p>

            {typeof window !== 'undefined' && window.location.hostname.includes('vercel.app') && (
              <div style={{ 
                backgroundColor: 'rgba(234, 179, 8, 0.12)', 
                border: '1px solid rgba(234, 179, 8, 0.35)', 
                borderRadius: '8px', 
                padding: '12px 14px', 
                marginBottom: '16px', 
                fontSize: '13px', 
                color: '#fde047', 
                lineHeight: 1.5 
              }}>
                <strong>⚡ Home Streaming Setup:</strong> You are on Vercel (static hosting). Large movie files (1GB+) stream directly from your laptop server. To stream movies to your mobile phone or TV, connect to your laptop's Wi-Fi network address (see <strong>Connect TV & Phone</strong>) or run <code>npm run tunnel</code>.
              </div>
            )}

            {/* Mode Selector Tabs: Movie vs TV Show / Episode */}
            <div 
              style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '8px', 
                backgroundColor: 'rgba(255, 255, 255, 0.05)', 
                padding: '4px', 
                borderRadius: '8px',
                marginBottom: '20px'
              }}
            >
              <button
                type="button"
                onClick={() => setUploadMode('movie')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '10px 14px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: uploadMode === 'movie' ? '#E50914' : 'transparent',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'background-color 150ms ease'
                }}
              >
                <Film size={16} />
                <span>Single Movie</span>
              </button>

              <button
                type="button"
                onClick={() => setUploadMode('episode')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '10px 14px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: uploadMode === 'episode' ? '#E50914' : 'transparent',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'background-color 150ms ease'
                }}
              >
                <Tv size={16} />
                <span>TV Show / Episode</span>
              </button>
            </div>

            {/* If TV Show / Episode Mode: Option to Add to Existing vs New Series */}
            {uploadMode === 'episode' && (
              <div 
                style={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.04)', 
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '8px', 
                  padding: '14px', 
                  marginBottom: '20px' 
                }}
              >
                <div style={{ display: 'flex', gap: '20px', marginBottom: '14px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', color: '#ffffff', fontWeight: 600 }}>
                    <input 
                      type="radio" 
                      name="episodeAction" 
                      value="existing" 
                      checked={episodeAction === 'existing'}
                      onChange={() => setEpisodeAction('existing')}
                      disabled={seriesList.length === 0}
                    />
                    <ListPlus size={15} color="#46d369" />
                    <span>Add Episode to Existing Series ({seriesList.length})</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', color: '#ffffff', fontWeight: 600 }}>
                    <input 
                      type="radio" 
                      name="episodeAction" 
                      value="new" 
                      checked={episodeAction === 'new'}
                      onChange={() => setEpisodeAction('new')}
                    />
                    <PlusCircle size={15} color="#E50914" />
                    <span>Create Brand New Series</span>
                  </label>
                </div>

                {episodeAction === 'existing' ? (
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                      Choose Series *
                    </label>
                    <select
                      value={selectedSeriesId}
                      onChange={(e) => setSelectedSeriesId(e.target.value)}
                      style={{ 
                        width: '100%', 
                        padding: '10px 12px', 
                        backgroundColor: '#232323', 
                        border: '1px solid rgba(255, 255, 255, 0.15)', 
                        borderRadius: '6px', 
                        color: '#ffffff', 
                        outline: 'none',
                        fontSize: '14px'
                      }}
                    >
                      {seriesList.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.title} ({s.seasons?.reduce((acc, season) => acc + season.episodes.length, 0) || 0} episodes currently)
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                      New Series Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Stranger Things, Kapil Sharma Show"
                      style={{ 
                        width: '100%', 
                        padding: '10px 12px', 
                        backgroundColor: '#232323', 
                        border: '1px solid rgba(255, 255, 255, 0.15)', 
                        borderRadius: '6px', 
                        color: '#ffffff', 
                        outline: 'none' 
                      }}
                    />
                  </div>
                )}

                {/* Season & Episode Number Pickers */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: '12px', marginTop: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                      Season #
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={seasonNumber}
                      onChange={(e) => setSeasonNumber(Math.max(1, parseInt(e.target.value) || 1))}
                      style={{ width: '100%', padding: '10px 12px', backgroundColor: '#232323', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '6px', color: '#ffffff', outline: 'none' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                      Episode #
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={episodeNumber}
                      onChange={(e) => setEpisodeNumber(Math.max(1, parseInt(e.target.value) || 1))}
                      style={{ width: '100%', padding: '10px 12px', backgroundColor: '#232323', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '6px', color: '#ffffff', outline: 'none' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                      Episode Title (Optional)
                    </label>
                    <input
                      type="text"
                      value={episodeTitle}
                      onChange={(e) => setEpisodeTitle(e.target.value)}
                      placeholder={`Episode ${episodeNumber}`}
                      style={{ width: '100%', padding: '10px 12px', backgroundColor: '#232323', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '6px', color: '#ffffff', outline: 'none' }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Video File Drag/Drop Picker Box */}
            <div 
              style={{ 
                marginBottom: '18px', 
                padding: '20px 16px', 
                border: '2px dashed #E50914', 
                borderRadius: '8px', 
                textAlign: 'center', 
                backgroundColor: 'rgba(229, 9, 20, 0.05)',
                cursor: 'pointer'
              }}
            >
              <input 
                type="file" 
                accept="video/mp4,video/mkv,video/webm,video/quicktime,video/avi,video/*" 
                onChange={handleFileSelect} 
                id="video-master-file-input" 
                style={{ display: 'none' }} 
              />
              <label 
                htmlFor="video-master-file-input" 
                style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}
              >
                <FileVideo size={36} color="#E50914" />
                <span style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff' }}>
                  {videoFile ? `Selected: ${videoFile.name}` : 'Click to select Video File (.mkv, .mp4, .webm)'}
                </span>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {videoFile ? `Size: ${(videoFile.size / (1024 * 1024)).toFixed(1)} MB` : 'Streamable instantly on TV, phone, or any laptop in the house'}
                </span>
              </label>
            </div>

            {/* Upload Progress Bar */}
            {uploading && (
              <div style={{ marginBottom: '18px', backgroundColor: '#232323', padding: '14px', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>
                  <span>Uploading to Home Server...</span>
                  <span style={{ color: '#E50914' }}>{uploadProgress}%</span>
                </div>
                <div style={{ height: '8px', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${uploadProgress}%`, height: '100%', backgroundColor: '#E50914', transition: 'width 200ms ease' }} />
                </div>
              </div>
            )}

            {/* Title & Metadata (When Single Movie is chosen) */}
            {uploadMode === 'movie' && (
              <>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Movie Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Inception, Interstellar"
                    style={{ width: '100%', padding: '10px 12px', backgroundColor: '#232323', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '6px', color: '#ffffff', outline: 'none' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                      Genres
                    </label>
                    <input
                      type="text"
                      value={genres}
                      onChange={(e) => setGenres(e.target.value)}
                      placeholder="Action, Sci-Fi, Drama"
                      style={{ width: '100%', padding: '10px 12px', backgroundColor: '#232323', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '6px', color: '#ffffff', outline: 'none' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                      Poster Image URL (Optional)
                    </label>
                    <input
                      type="text"
                      value={posterUrl}
                      onChange={(e) => setPosterUrl(e.target.value)}
                      placeholder="https://..."
                      style={{ width: '100%', padding: '10px 12px', backgroundColor: '#232323', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '6px', color: '#ffffff', outline: 'none' }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Description / Notes (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={synopsis}
                    onChange={(e) => setSynopsis(e.target.value)}
                    placeholder="Optional description of this movie..."
                    style={{ width: '100%', padding: '10px 12px', backgroundColor: '#232323', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '6px', color: '#ffffff', outline: 'none' }}
                  />
                </div>
              </>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary tv-focusable"
                data-tv-focus="true"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={uploading || (uploadMode === 'movie' && !title.trim()) || (uploadMode === 'episode' && episodeAction === 'new' && !title.trim())}
                className="btn tv-focusable"
                data-tv-focus="true"
                style={{ 
                  padding: '10px 24px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  backgroundColor: '#E50914',
                  color: '#ffffff',
                  fontWeight: 700,
                  borderRadius: '4px',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <UploadCloud size={16} />
                <span>
                  {uploading 
                    ? 'Uploading...' 
                    : uploadMode === 'episode' && episodeAction === 'existing'
                    ? `Add Episode ${episodeNumber} to Series`
                    : uploadMode === 'episode'
                    ? 'Create Series & Add Episode'
                    : 'Upload Movie'}
                </span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
