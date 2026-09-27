import React, { useState } from 'react';
import { 
  Tv, 
  ChevronUp, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  Circle, 
  CornerUpLeft, 
  Home, 
  Play, 
  Minimize2, 
  Maximize2,
  Scan
} from 'lucide-react';
import { triggerVirtualRemoteKey } from './useTvNavigation';
import { useApp } from '../../context/AppContext';

export const VirtualTvRemote: React.FC = () => {
  const [minimized, setMinimized] = useState<boolean>(false);
  const { tvMode, setTvMode, tvSafeZoneGuide, setTvSafeZoneGuide } = useApp();

  return (
    <aside 
      aria-label="Virtual TV Remote Control"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9000,
        backgroundColor: 'rgba(21, 21, 31, 0.95)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '16px',
        padding: minimized ? '10px 14px' : '16px',
        boxShadow: '0 12px 36px rgba(0, 0, 0, 0.6), 0 0 20px rgba(229, 73, 61, 0.15)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
        width: minimized ? 'auto' : '190px',
        transition: 'all 200ms ease-out',
        userSelect: 'none'
      }}
    >
      {/* Remote Header */}
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          gap: '8px',
          borderBottom: minimized ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
          paddingBottom: minimized ? '0' : '8px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Tv size={16} color="var(--accent)" />
          <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.5px' }}>
            TV REMOTE
          </span>
        </div>

        <button
          onClick={() => setMinimized(!minimized)}
          title={minimized ? "Expand Remote" : "Minimize Remote"}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          {minimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
        </button>
      </div>

      {!minimized && (
        <>
          {/* Quick TV Control Toggles */}
          <div style={{ display: 'flex', gap: '6px', width: '100%', justifyContent: 'center' }}>
            <button
              onClick={() => setTvSafeZoneGuide(!tvSafeZoneGuide)}
              title="Toggle 90% TV Safe Zone Border (DESIGN.md §4)"
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                padding: '6px',
                fontSize: '10px',
                fontWeight: 600,
                borderRadius: '6px',
                backgroundColor: tvSafeZoneGuide ? 'var(--accent)' : 'var(--surface-raised)',
                color: '#ffffff',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <Scan size={12} />
              Safe Zone
            </button>

            <button
              onClick={() => setTvMode(!tvMode)}
              title="Toggle TV D-Pad Mode"
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                padding: '6px',
                fontSize: '10px',
                fontWeight: 600,
                borderRadius: '6px',
                backgroundColor: tvMode ? 'rgba(34, 197, 94, 0.2)' : 'var(--surface-raised)',
                color: tvMode ? '#4ade80' : 'var(--text-secondary)',
                border: tvMode ? '1px solid #4ade80' : 'none',
                cursor: 'pointer'
              }}
            >
              D-Pad {tvMode ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* D-Pad Circular Controller */}
          <div
            style={{
              position: 'relative',
              width: '140px',
              height: '140px',
              backgroundColor: '#111119',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid rgba(255, 255, 255, 0.1)',
              boxShadow: 'inset 0 4px 12px rgba(0, 0, 0, 0.8)'
            }}
          >
            {/* UP */}
            <button
              onClick={() => triggerVirtualRemoteKey('up')}
              title="D-Pad Up"
              style={{
                position: 'absolute',
                top: '6px',
                background: 'none',
                border: 'none',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                padding: '6px'
              }}
            >
              <ChevronUp size={22} />
            </button>

            {/* DOWN */}
            <button
              onClick={() => triggerVirtualRemoteKey('down')}
              title="D-Pad Down"
              style={{
                position: 'absolute',
                bottom: '6px',
                background: 'none',
                border: 'none',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                padding: '6px'
              }}
            >
              <ChevronDown size={22} />
            </button>

            {/* LEFT */}
            <button
              onClick={() => triggerVirtualRemoteKey('left')}
              title="D-Pad Left"
              style={{
                position: 'absolute',
                left: '6px',
                background: 'none',
                border: 'none',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                padding: '6px'
              }}
            >
              <ChevronLeft size={22} />
            </button>

            {/* RIGHT */}
            <button
              onClick={() => triggerVirtualRemoteKey('right')}
              title="D-Pad Right"
              style={{
                position: 'absolute',
                right: '6px',
                background: 'none',
                border: 'none',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                padding: '6px'
              }}
            >
              <ChevronRight size={22} />
            </button>

            {/* CENTER OK / SELECT BUTTON */}
            <button
              onClick={() => triggerVirtualRemoteKey('select')}
              title="Select / OK"
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                backgroundColor: 'var(--accent)',
                border: '2px solid #ffffff',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 0 12px var(--accent-glow)'
              }}
            >
              <Circle size={18} fill="#ffffff" />
            </button>
          </div>

          {/* Bottom Remote Action Row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              padding: '0 8px'
            }}
          >
            <button
              onClick={() => triggerVirtualRemoteKey('back')}
              title="Back (Esc / Remote Back Button)"
              style={{
                background: 'var(--surface-raised)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'var(--text-primary)',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <CornerUpLeft size={16} />
            </button>

            <button
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                const homeBtn = document.querySelector<HTMLElement>('#nav-home-btn');
                homeBtn?.focus();
              }}
              title="Home Screen"
              style={{
                background: 'var(--surface-raised)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'var(--text-primary)',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <Home size={16} />
            </button>

            <button
              onClick={() => {
                const playBtn = document.querySelector<HTMLVideoElement>('video');
                if (playBtn) {
                  if (playBtn.paused) playBtn.play();
                  else playBtn.pause();
                }
              }}
              title="Play / Pause"
              style={{
                background: 'var(--surface-raised)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'var(--text-primary)',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <Play size={16} />
            </button>
          </div>

          <div style={{ fontSize: '10px', color: 'var(--text-muted)', textAlign: 'center' }}>
            Arrow keys & Enter on keyboard also navigate
          </div>
        </>
      )}
    </aside>
  );
};
