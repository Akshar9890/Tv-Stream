import React, { useState, useEffect, useRef } from 'react';
import { Play, Plus, Check, Info, Star } from 'lucide-react';
import { ContentItem } from '../../types';
import { useApp } from '../../context/AppContext';

interface HeroBannerProps {
  item: ContentItem;
  onSelect: (item: ContentItem) => void;
  onPlay: (item: ContentItem) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ item, onSelect, onPlay }) => {
  const { watchlist, toggleWatchlist, getResumeProgress } = useApp();
  const inWatchlist = watchlist.includes(item.id);
  const resumeItem = getResumeProgress(item.id);

  // Muted trailer preview after 1.5s dwell
  const [showTrailer, setShowTrailer] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    setShowTrailer(false);
    const timer = setTimeout(() => {
      if (item.trailerUrl || item.streamManifestUrl) {
        setShowTrailer(true);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [item]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <section 
      aria-label="Featured Title"
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '75vh',
        maxHeight: '850px',
        display: 'flex',
        alignItems: 'flex-end',
        padding: '0 var(--tv-safe-padding-x) 64px var(--tv-safe-padding-x)',
        overflow: 'hidden'
      }}
    >
      {/* Background Media: Backdrop image or Muted Trailer Preview */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          overflow: 'hidden'
        }}
      >
        {showTrailer ? (
          <video
            ref={videoRef}
            src={item.trailerUrl || item.streamManifestUrl}
            autoPlay
            muted
            loop
            playsInline
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: 'brightness(0.7)'
            }}
          />
        ) : (
          <img
            src={item.backdropUrl}
            alt={item.title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: 'brightness(0.7)'
            }}
          />
        )}

        {/* Authentic Netflix Vignette Gradients */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(77deg, rgba(20,20,20,.85) 0%, rgba(20,20,20,0.5) 45%, transparent 75%), linear-gradient(180deg, rgba(20,20,20,0) 0%, rgba(20,20,20,.3) 40%, #141414 85%, #141414 100%)'
          }}
        />
      </div>

      {/* Hero Content Details */}
      <div 
        style={{
          position: 'relative',
          zIndex: 2,
          maxWidth: '680px'
        }}
        className="slide-up"
      >
        {/* Netflix Brand & Type Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
          <span style={{ 
            color: '#E50914', 
            fontWeight: 900, 
            fontSize: '28px', 
            fontFamily: "'Arial Black', sans-serif",
            textShadow: '0 2px 8px rgba(229, 9, 20, 0.4)'
          }}>
            N
          </span>
          <span style={{ 
            letterSpacing: '5px', 
            fontSize: '13px', 
            fontWeight: 800, 
            color: 'rgba(255, 255, 255, 0.9)',
            textTransform: 'uppercase'
          }}>
            {item.type === 'series' ? 'SERIES' : 'FILM'}
          </span>
        </div>

        {/* Title */}
        <h1 
          style={{ 
            fontSize: 'clamp(36px, 5.5vw, 60px)', 
            fontWeight: 900, 
            lineHeight: 1.08,
            letterSpacing: '-0.5px',
            marginBottom: '14px',
            textShadow: '0 4px 20px rgba(0, 0, 0, 0.9)'
          }}
        >
          {item.title}
        </h1>

        {/* Match info and metadata */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px', flexWrap: 'wrap' }}>
          <span style={{ color: '#46d369', fontWeight: 800, fontSize: '15px' }}>
            98% Match
          </span>

          <span style={{ fontSize: '14px', color: '#e5e5e5', fontWeight: 600 }}>
            {item.releaseYear}
          </span>

          <span style={{ 
            fontSize: '11px', 
            fontWeight: 700, 
            color: '#e5e5e5', 
            border: '1px solid rgba(255, 255, 255, 0.5)', 
            padding: '1px 6px', 
            borderRadius: '2px' 
          }}>
            {item.ageRating}
          </span>

          <span style={{ fontSize: '13px', color: '#e5e5e5', fontWeight: 600 }}>
            {item.type === 'series' && item.seasons && item.seasons.length > 0 
              ? `${item.seasons.length} Season${item.seasons.length > 1 ? 's' : ''}`
              : 'HD'}
          </span>

          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#f59e0b', fontSize: '13px', fontWeight: 600 }}>
            <Star size={14} fill="#f59e0b" />
            {item.rating}
          </span>
        </div>

        {/* Synopsis */}
        <p
          style={{
            fontSize: '16px',
            lineHeight: 1.5,
            color: '#e5e5e5',
            marginBottom: '24px',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textShadow: '0 1px 4px rgba(0, 0, 0, 0.7)'
          }}
        >
          {item.synopsis}
        </p>

        {/* CTA Buttons in Netflix Style */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          {/* Netflix Signature Solid White Play Button */}
          <button
            onClick={() => onPlay(item)}
            className="btn tv-focusable"
            data-tv-focus="true"
            id="hero-play-btn"
            style={{ 
              padding: '12px 30px', 
              fontSize: '16px',
              backgroundColor: '#ffffff',
              color: '#000000',
              fontWeight: 800,
              borderRadius: '4px',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              transition: 'background-color 150ms ease'
            }}
          >
            <Play size={22} fill="#000000" />
            <span>
              {resumeItem && resumeItem.progressSeconds > 10 
                ? `Resume (${formatTime(resumeItem.progressSeconds)})` 
                : 'Play'}
            </span>
          </button>

          {/* Netflix Signature Translucent More Info Button */}
          <button
            onClick={() => onSelect(item)}
            className="btn tv-focusable"
            data-tv-focus="true"
            style={{ 
              padding: '12px 26px', 
              fontSize: '16px',
              backgroundColor: 'rgba(109, 109, 110, 0.7)',
              color: '#ffffff',
              fontWeight: 700,
              borderRadius: '4px',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              transition: 'background-color 150ms ease'
            }}
          >
            <Info size={20} />
            <span>More Info</span>
          </button>

          {/* Add / In Watchlist */}
          <button
            onClick={() => toggleWatchlist(item.id)}
            className="btn tv-focusable"
            data-tv-focus="true"
            title={inWatchlist ? 'Remove from My List' : 'Add to My List'}
            style={{ 
              width: '44px',
              height: '44px',
              padding: 0,
              borderRadius: '50%',
              backgroundColor: 'rgba(42, 42, 42, 0.6)',
              border: '2px solid rgba(255, 255, 255, 0.5)',
              color: inWatchlist ? '#46d369' : '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            {inWatchlist ? <Check size={20} color="#46d369" /> : <Plus size={20} />}
          </button>
        </div>
      </div>
    </section>
  );
};
