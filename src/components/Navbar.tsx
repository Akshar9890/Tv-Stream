import React from 'react';
import { 
  Search, 
  UploadCloud, 
  Sparkles, 
  Baby,
  Download,
  Smartphone
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface NavbarProps {
  activeCategory: string;
  onSelectCategory: (cat: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeCategory, onSelectCategory }) => {
  const { 
    subscription, 
    setShowBillingModal, 
    setShowUploadModal, 
    setShowSearchModal,
    setShowConnectModal,
    setShowDownloadsModal,
    setPreselectedSeriesId,
    profiles,
    currentProfile,
    setCurrentProfile
  } = useApp();

  return (
    <nav
      aria-label="Main Navigation"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: 'rgba(20, 20, 20, 0.95)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px var(--tv-safe-padding-x)',
        transition: 'background-color 200ms ease'
      }}
    >
      {/* Brand & Left Category Links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
        {/* Netflix-style StreamFlix Brand Logo */}
        <button
          id="nav-home-btn"
          onClick={() => onSelectCategory('all')}
          className="tv-focusable"
          data-tv-focus="true"
          style={{
            background: 'none',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            padding: '4px 8px',
            borderRadius: '4px'
          }}
        >
          <span style={{ 
            fontSize: '24px', 
            fontWeight: 900, 
            letterSpacing: '1px', 
            color: '#E50914', 
            textTransform: 'uppercase', 
            fontFamily: "'Arial Black', 'Impact', sans-serif",
            textShadow: '0 2px 10px rgba(229, 9, 20, 0.4)'
          }}>
            STREAMFLIX
          </span>
        </button>

        {/* Categories / Navigation Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={() => onSelectCategory('all')}
            className={`tv-focusable ${activeCategory === 'all' ? 'tv-focused' : ''}`}
            data-tv-focus="true"
            style={{
              background: activeCategory === 'all' ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
              color: activeCategory === 'all' ? '#ffffff' : '#e5e5e5',
              border: 'none',
              borderRadius: '4px',
              padding: '6px 12px',
              fontSize: '14px',
              fontWeight: activeCategory === 'all' ? 700 : 500,
              cursor: 'pointer'
            }}
          >
            Home
          </button>

          <button
            onClick={() => onSelectCategory('series')}
            className={`tv-focusable ${activeCategory === 'series' ? 'tv-focused' : ''}`}
            data-tv-focus="true"
            style={{
              background: activeCategory === 'series' ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
              color: activeCategory === 'series' ? '#ffffff' : '#e5e5e5',
              border: 'none',
              borderRadius: '4px',
              padding: '6px 12px',
              fontSize: '14px',
              fontWeight: activeCategory === 'series' ? 700 : 500,
              cursor: 'pointer'
            }}
          >
            TV Shows & Series
          </button>

          <button
            onClick={() => onSelectCategory('movies')}
            className={`tv-focusable ${activeCategory === 'movies' ? 'tv-focused' : ''}`}
            data-tv-focus="true"
            style={{
              background: activeCategory === 'movies' ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
              color: activeCategory === 'movies' ? '#ffffff' : '#e5e5e5',
              border: 'none',
              borderRadius: '4px',
              padding: '6px 12px',
              fontSize: '14px',
              fontWeight: activeCategory === 'movies' ? 700 : 500,
              cursor: 'pointer'
            }}
          >
            Movies
          </button>

          <button
            onClick={() => onSelectCategory('kids')}
            className={`tv-focusable ${activeCategory === 'kids' ? 'tv-focused' : ''}`}
            data-tv-focus="true"
            style={{
              background: activeCategory === 'kids' ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
              color: activeCategory === 'kids' ? '#ffffff' : '#e5e5e5',
              border: 'none',
              borderRadius: '4px',
              padding: '6px 12px',
              fontSize: '14px',
              fontWeight: activeCategory === 'kids' ? 700 : 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Baby size={14} />
            Kids
          </button>
        </div>
      </div>

      {/* Right Action Icons & Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Search Button */}
        <button
          onClick={() => setShowSearchModal(true)}
          className="btn btn-ghost tv-focusable"
          data-tv-focus="true"
          title="Search (Instant / Remote)"
          style={{ width: '38px', height: '38px', borderRadius: '50%', padding: 0 }}
        >
          <Search size={18} />
        </button>

        {/* Offline Downloads Button */}
        <button
          onClick={() => setShowDownloadsModal(true)}
          className="btn btn-secondary tv-focusable"
          data-tv-focus="true"
          title="Offline Downloads"
          style={{ padding: '6px 12px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Download size={15} color="var(--accent)" />
          <span>Downloads</span>
        </button>

        {/* Connect TV / Devices Button */}
        <button
          onClick={() => setShowConnectModal(true)}
          className="btn btn-secondary tv-focusable"
          data-tv-focus="true"
          title="Connect Phone, TV, or Another Device"
          style={{ padding: '6px 12px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(59, 130, 246, 0.15)', borderColor: 'rgba(59, 130, 246, 0.4)' }}
        >
          <Smartphone size={15} color="#60a5fa" />
          <span>Connect TV/Phone</span>
        </button>

        {/* Upload Movie / Episode Button */}
        <button
          onClick={() => {
            setPreselectedSeriesId(null);
            setShowUploadModal(true);
          }}
          className="btn btn-primary tv-focusable"
          data-tv-focus="true"
          title="Upload Movie or TV Episode"
          style={{ padding: '6px 14px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <UploadCloud size={15} color="#ffffff" />
          <span>+ Add Movie / Episode</span>
        </button>

        {/* Subscription Plan Badge CTA */}
        <button
          onClick={() => setShowBillingModal(true)}
          className="btn tv-focusable"
          data-tv-focus="true"
          style={{
            background: subscription.planId === 'premium'
              ? 'linear-gradient(135deg, #ec4899, #e5493d)'
              : subscription.planId === 'vip'
              ? 'linear-gradient(135deg, #f59e0b, #d97706)'
              : 'var(--surface-raised)',
            color: subscription.planId === 'vip' ? '#000000' : '#ffffff',
            padding: '6px 12px',
            fontSize: '12px',
            fontWeight: 800,
            letterSpacing: '0.4px',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Sparkles size={14} />
          <span>{subscription.planId.toUpperCase()}</span>
        </button>

        {/* User Profile Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', borderLeft: '1px solid var(--border-subtle)', paddingLeft: '14px' }}>
          <img
            src={currentProfile.avatar}
            alt={currentProfile.name}
            style={{ width: '32px', height: '32px', borderRadius: '4px', objectFit: 'cover' }}
          />
          <select
            value={currentProfile.id}
            onChange={(e) => {
              const selected = profiles.find(p => p.id === e.target.value);
              if (selected) setCurrentProfile(selected);
            }}
            style={{
              backgroundColor: 'transparent',
              color: 'var(--text-secondary)',
              border: 'none',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            {profiles.map(p => (
              <option key={p.id} value={p.id} style={{ backgroundColor: 'var(--surface)', color: '#ffffff' }}>
                {p.name} {p.isKids ? '(Kids)' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>
    </nav>
  );
};
