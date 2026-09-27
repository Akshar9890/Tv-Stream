import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ContentItem } from '../../types';
import { ContentCard } from './ContentCard';

interface ContentRowProps {
  title: string;
  subtitle?: string;
  items: ContentItem[];
  onSelect: (item: ContentItem) => void;
  onPlay: (item: ContentItem) => void;
  icon?: React.ReactNode;
}

export const ContentRow: React.FC<ContentRowProps> = ({
  title,
  subtitle,
  items,
  onSelect,
  onPlay,
  icon
}) => {
  const rowRef = useRef<HTMLDivElement | null>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!rowRef.current) return;
    const scrollAmount = rowRef.current.clientWidth * 0.75;
    rowRef.current.scrollBy({
      left: direction === 'right' ? scrollAmount : -scrollAmount,
      behavior: 'smooth'
    });
  };

  if (items.length === 0) return null;

  return (
    <div style={{ marginBottom: '40px', position: 'relative' }}>
      {/* Row Header */}
      <div 
        style={{ 
          display: 'flex', 
          alignItems: 'baseline', 
          gap: '12px', 
          marginBottom: '16px',
          padding: '0 var(--tv-safe-padding-x)' 
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {icon && <span style={{ color: 'var(--accent)' }}>{icon}</span>}
          <h2 style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '-0.3px', color: 'var(--text-primary)' }}>
            {title}
          </h2>
        </div>
        {subtitle && (
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            {subtitle}
          </span>
        )}
      </div>

      {/* Row Scroll Controls & Cards Container */}
      <div style={{ position: 'relative', width: '100%' }}>
        {/* Left Arrow */}
        <button
          onClick={() => scroll('left')}
          title="Scroll Left"
          style={{
            position: 'absolute',
            left: '8px',
            top: '40%',
            transform: 'translateY(-50%)',
            zIndex: 10,
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: 'rgba(21, 21, 31, 0.85)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.6)'
          }}
        >
          <ChevronLeft size={22} />
        </button>

        {/* Scrollable Track */}
        <div
          ref={rowRef}
          style={{
            display: 'flex',
            gap: '16px',
            overflowX: 'auto',
            padding: '12px var(--tv-safe-padding-x)',
            scrollBehavior: 'smooth',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
        >
          {items.map(item => (
            <ContentCard
              key={item.id}
              content={item}
              onSelect={onSelect}
              onPlay={onPlay}
            />
          ))}
        </div>

        {/* Right Arrow */}
        <button
          onClick={() => scroll('right')}
          title="Scroll Right"
          style={{
            position: 'absolute',
            right: '8px',
            top: '40%',
            transform: 'translateY(-50%)',
            zIndex: 10,
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: 'rgba(21, 21, 31, 0.85)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.6)'
          }}
        >
          <ChevronRight size={22} />
        </button>
      </div>
    </div>
  );
};
