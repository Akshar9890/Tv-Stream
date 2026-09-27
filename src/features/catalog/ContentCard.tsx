import React from 'react';
import { Play, Plus, Check, Star, Trash2 } from 'lucide-react';
import { ContentItem } from '../../types';
import { useApp } from '../../context/AppContext';

interface ContentCardProps {
  content: ContentItem;
  onSelect: (item: ContentItem) => void;
  onPlay: (item: ContentItem) => void;
}

export const ContentCard: React.FC<ContentCardProps> = ({ content, onSelect, onPlay }) => {
  const { watchlist, toggleWatchlist, getResumeProgress, deleteContent } = useApp();
  const inWatchlist = watchlist.includes(content.id);
  const resumeItem = getResumeProgress(content.id);

  const percentWatched = resumeItem 
    ? Math.min(100, Math.round((resumeItem.progressSeconds / resumeItem.durationSeconds) * 100)) 
    : 0;

  return (
    <div
      role="button"
      tabIndex={0}
      data-tv-focus="true"
      onClick={() => onSelect(content)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          onSelect(content);
        }
      }}
      className="tv-focusable"
      style={{
        position: 'relative',
        flex: '0 0 auto',
        width: '220px',
        backgroundColor: '#181818',
        borderRadius: '6px',
        overflow: 'hidden',
        boxShadow: '0 4px 14px rgba(0, 0, 0, 0.6)',
        cursor: 'pointer',
        transition: 'transform 200ms ease, box-shadow 200ms ease'
      }}
    >
      {/* Poster Image Container */}
      <div style={{ position: 'relative', width: '100%', height: '310px', backgroundColor: '#232323' }}>
        <img
          src={content.posterUrl}
          alt={content.title}
          loading="lazy"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block'
          }}
        />

        {/* Netflix Red N Badge */}
        <div 
          style={{
            position: 'absolute',
            top: '8px',
            left: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            pointerEvents: 'none'
          }}
        >
          <span style={{ 
            color: '#E50914', 
            fontWeight: 900, 
            fontSize: '18px', 
            fontFamily: "'Arial Black', sans-serif",
            textShadow: '0 2px 6px rgba(0, 0, 0, 0.8)'
          }}>
            N
          </span>
          {content.type === 'series' && (
            <span style={{ 
              fontSize: '10px', 
              fontWeight: 800, 
              color: '#ffffff', 
              backgroundColor: 'rgba(0, 0, 0, 0.6)', 
              padding: '2px 5px', 
              borderRadius: '2px',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              Series
            </span>
          )}
        </div>

        {/* Watch Progress Bar (if watched) */}
        {percentWatched > 0 && (
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '4px',
              backgroundColor: 'rgba(255, 255, 255, 0.25)'
            }}
          >
            <div
              style={{
                width: `${percentWatched}%`,
                height: '100%',
                backgroundColor: '#E50914'
              }}
            />
          </div>
        )}

        {/* Hover/Focus Play Overlay Icon */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(20, 20, 20, 0.95) 0%, transparent 60%)',
            display: 'flex',
            alignItems: 'flex-end',
            padding: '12px',
            gap: '8px'
          }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPlay(content);
            }}
            title="Play Now"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: '#ffffff',
              color: '#000000',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.6)'
            }}
          >
            <Play size={16} fill="#000000" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleWatchlist(content.id);
            }}
            title={inWatchlist ? "Remove from My List" : "Add to My List"}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: 'rgba(42, 42, 42, 0.7)',
              color: inWatchlist ? '#46d369' : '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            {inWatchlist ? <Check size={16} color="#46d369" /> : <Plus size={16} />}
          </button>

          <button
            onClick={async (e) => {
              e.stopPropagation();
              const isSeries = content.type === 'series';
              if (window.confirm(`Delete "${content.title}" ${isSeries ? 'and all its episodes' : ''} from your library?`)) {
                await deleteContent(content.id);
              }
            }}
            title="Delete from Library"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: 'rgba(42, 42, 42, 0.7)',
              color: '#a3a3a3',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => { 
              (e.currentTarget as HTMLElement).style.color = '#ef4444'; 
              (e.currentTarget as HTMLElement).style.borderColor = '#ef4444'; 
            }}
            onMouseLeave={(e) => { 
              (e.currentTarget as HTMLElement).style.color = '#a3a3a3'; 
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255, 255, 255, 0.3)'; 
            }}
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* Metadata Bottom Card */}
      <div style={{ padding: '10px 12px' }}>
        <h4 
          style={{ 
            fontSize: '14px', 
            fontWeight: 700, 
            whiteSpace: 'nowrap', 
            overflow: 'hidden', 
            textOverflow: 'ellipsis',
            color: '#ffffff'
          }}
        >
          {content.title}
        </h4>

        <div 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            fontSize: '11px', 
            color: '#a3a3a3',
            marginTop: '4px' 
          }}
        >
          <span style={{ color: '#46d369', fontWeight: 700 }}>98% Match</span>
          <span>
            {content.type === 'series' && content.seasons && content.seasons.length > 0
              ? `${content.seasons.reduce((acc, s) => acc + s.episodes.length, 0)} Eps`
              : `${content.releaseYear}`}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#f59e0b', fontWeight: 600 }}>
            <Star size={11} fill="#f59e0b" />
            {content.rating}
          </span>
        </div>
      </div>
    </div>
  );
};
