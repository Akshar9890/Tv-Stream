import React, { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { ContentItem } from '../../types';
import { ContentCard } from '../catalog/ContentCard';
import { useApp } from '../../context/AppContext';

interface SearchModalProps {
  onClose: () => void;
  onSelect: (item: ContentItem) => void;
  onPlay: (item: ContentItem) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ onClose, onSelect, onPlay }) => {
  const { catalog } = useApp();
  const [query, setQuery] = useState<string>('');
  const [filterBucket, setFilterBucket] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  const filteredItems = useMemo(() => {
    return catalog.filter(item => {
      const q = query.toLowerCase().trim();
      const matchesQuery = !q || (
        item.title.toLowerCase().includes(q) ||
        item.director.toLowerCase().includes(q) ||
        item.cast.some(c => c.toLowerCase().includes(q)) ||
        item.genres.some(g => g.toLowerCase().includes(q)) ||
        item.synopsis.toLowerCase().includes(q)
      );

      const matchesBucket = filterBucket === 'all' || item.bucket === filterBucket;
      const matchesType = filterType === 'all' || item.type === filterType;

      return matchesQuery && matchesBucket && matchesType;
    });
  }, [catalog, query, filterBucket, filterType]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-label="Search Catalog"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9600,
        backgroundColor: 'rgba(5, 5, 8, 0.95)',
        backdropFilter: 'blur(20px)',
        display: 'flex',
        flexDirection: 'column',
        padding: '32px var(--tv-safe-padding-x)'
      }}
    >
      {/* Search Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <div
          style={{
            position: 'relative',
            flex: 1,
            backgroundColor: 'var(--surface-raised)',
            borderRadius: '8px',
            border: '2px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            padding: '0 16px'
          }}
        >
          <Search size={22} color="var(--text-secondary)" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search movies, series, actors, directors, genres..."
            style={{
              width: '100%',
              backgroundColor: 'transparent',
              border: 'none',
              padding: '16px 12px',
              fontSize: '18px',
              color: '#ffffff',
              outline: 'none'
            }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
            >
              <X size={18} />
            </button>
          )}
        </div>

        <button
          onClick={onClose}
          className="btn btn-secondary tv-focusable"
          data-tv-focus="true"
          title="Close (Esc)"
          style={{ padding: '14px 20px', borderRadius: '8px' }}
        >
          Close
        </button>
      </div>

      {/* Filter Chips */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '28px' }}>
        {/* Bucket Filters */}
        <button
          onClick={() => setFilterBucket('all')}
          className="tv-focusable"
          data-tv-focus="true"
          style={{
            padding: '8px 14px',
            borderRadius: '20px',
            border: filterBucket === 'all' ? '1px solid var(--accent)' : '1px solid var(--border-subtle)',
            backgroundColor: filterBucket === 'all' ? 'var(--accent)' : 'var(--surface-raised)',
            color: '#ffffff',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          All Content
        </button>

        <button
          onClick={() => setFilterBucket('owned')}
          className="tv-focusable"
          data-tv-focus="true"
          style={{
            padding: '8px 14px',
            borderRadius: '20px',
            border: filterBucket === 'owned' ? '1px solid #4ade80' : '1px solid var(--border-subtle)',
            backgroundColor: filterBucket === 'owned' ? 'rgba(34, 197, 94, 0.25)' : 'var(--surface-raised)',
            color: '#4ade80',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          Bucket 1: Originals
        </button>

        <button
          onClick={() => setFilterBucket('licensed')}
          className="tv-focusable"
          data-tv-focus="true"
          style={{
            padding: '8px 14px',
            borderRadius: '20px',
            border: filterBucket === 'licensed' ? '1px solid #60a5fa' : '1px solid var(--border-subtle)',
            backgroundColor: filterBucket === 'licensed' ? 'rgba(59, 130, 246, 0.25)' : 'var(--surface-raised)',
            color: '#60a5fa',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          Bucket 2: Licensed
        </button>

        <button
          onClick={() => setFilterBucket('user_generated')}
          className="tv-focusable"
          data-tv-focus="true"
          style={{
            padding: '8px 14px',
            borderRadius: '20px',
            border: filterBucket === 'user_generated' ? '1px solid #c084fc' : '1px solid var(--border-subtle)',
            backgroundColor: filterBucket === 'user_generated' ? 'rgba(168, 85, 247, 0.25)' : 'var(--surface-raised)',
            color: '#c084fc',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          Bucket 3: Creator UGC
        </button>

        <span style={{ width: '1px', height: '24px', backgroundColor: 'var(--border-subtle)', margin: 'auto 4px' }} />

        {/* Type Filters */}
        <button
          onClick={() => setFilterType('all')}
          className="tv-focusable"
          data-tv-focus="true"
          style={{
            padding: '8px 14px',
            borderRadius: '20px',
            border: filterType === 'all' ? '1px solid var(--accent)' : '1px solid var(--border-subtle)',
            backgroundColor: filterType === 'all' ? 'var(--surface-hover)' : 'var(--surface-raised)',
            color: '#ffffff',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          All Formats
        </button>

        <button
          onClick={() => setFilterType('movie')}
          className="tv-focusable"
          data-tv-focus="true"
          style={{
            padding: '8px 14px',
            borderRadius: '20px',
            border: filterType === 'movie' ? '1px solid var(--accent)' : '1px solid var(--border-subtle)',
            backgroundColor: filterType === 'movie' ? 'var(--surface-hover)' : 'var(--surface-raised)',
            color: '#ffffff',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Movies
        </button>

        <button
          onClick={() => setFilterType('series')}
          className="tv-focusable"
          data-tv-focus="true"
          style={{
            padding: '8px 14px',
            borderRadius: '20px',
            border: filterType === 'series' ? '1px solid var(--accent)' : '1px solid var(--border-subtle)',
            backgroundColor: filterType === 'series' ? 'var(--surface-hover)' : 'var(--surface-raised)',
            color: '#ffffff',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          TV Series
        </button>
      </div>

      {/* Search Results Grid */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {filteredItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' }}>
            <Search size={48} style={{ opacity: 0.3, margin: '0 auto 16px auto' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px' }}>
              No titles match "{query}"
            </h3>
            <p style={{ fontSize: '14px' }}>
              Try searching by genre (Sci-Fi, Action, Animation) or actor name.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
              gap: '24px',
              paddingBottom: '40px'
            }}
          >
            {filteredItems.map(item => (
              <ContentCard
                key={item.id}
                content={item}
                onSelect={(selected) => {
                  onClose();
                  onSelect(selected);
                }}
                onPlay={(playing) => {
                  onClose();
                  onPlay(playing);
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
