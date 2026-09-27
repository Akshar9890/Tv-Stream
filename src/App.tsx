import React, { useState, useMemo } from 'react';
import { 
  Flame, 
  Clock, 
  Film, 
  Bookmark, 
  Tv 
} from 'lucide-react';
import { useApp } from './context/AppContext';
import { useTvNavigation } from './features/tv-remote/useTvNavigation';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './features/catalog/HeroBanner';
import { ContentRow } from './features/catalog/ContentRow';
import { TitleDetailModal } from './features/catalog/TitleDetailModal';
import { VideoPlayer } from './features/player/VideoPlayer';
import { UploadRightsModal } from './features/upload/UploadRightsModal';
import { SubscriptionModal } from './features/billing/SubscriptionModal';
import { SearchModal } from './features/search/SearchModal';
import { ConnectDeviceModal } from './features/devices/ConnectDeviceModal';
import { DownloadsModal } from './features/downloads/DownloadsModal';
import { ContentItem } from './types';

export const App: React.FC = () => {
  const { 
    catalog, 
    watchlist, 
    watchHistory, 
    activeTitle, 
    setActiveTitle, 
    playingContent, 
    setPlayingContent,
    showBillingModal,
    setShowBillingModal,
    showUploadModal,
    setShowUploadModal,
    showSearchModal,
    setShowSearchModal,
    showConnectModal,
    setShowConnectModal,
    showDownloadsModal,
    setShowDownloadsModal,
    tvMode,
    currentProfile
  } = useApp();

  // Enable TV D-pad spatial navigation
  useTvNavigation(tvMode);

  // Category filter state ('all' | 'movies' | 'series' | 'originals' | 'kids')
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Filter catalog based on active profile (Kids filter) and selected category
  const filteredCatalog = useMemo(() => {
    let list = catalog.filter(c => c.status === 'published');

    // If active profile is Kids, restrict strictly to U rating or family/animation
    if (currentProfile.isKids) {
      list = list.filter(c => c.ageRating === 'U' || c.genres.includes('Cartoons') || c.genres.includes('Family'));
    }

    if (selectedCategory === 'movies') {
      list = list.filter(c => c.type === 'movie');
    } else if (selectedCategory === 'series') {
      list = list.filter(c => c.type === 'series');
    } else if (selectedCategory === 'originals') {
      list = list.filter(c => c.bucket === 'owned');
    } else if (selectedCategory === 'kids') {
      list = list.filter(c => c.ageRating === 'U' || c.genres.includes('Cartoons') || c.genres.includes('Animation'));
    }

    return list;
  }, [catalog, currentProfile.isKids, selectedCategory]);

  // Featured title for Hero Banner
  const featuredItem = filteredCatalog.find(c => c.featured) || filteredCatalog[0];

  // Continue Watching items
  const continueWatchingItems = useMemo(() => {
    return watchHistory
      .map(h => catalog.find(c => c.id === h.contentId))
      .filter((c): c is ContentItem => Boolean(c && c.status === 'published'));
  }, [watchHistory, catalog]);

  // Watchlist items
  const watchlistItems = useMemo(() => {
    return watchlist
      .map(id => catalog.find(c => c.id === id))
      .filter((c): c is ContentItem => Boolean(c && c.status === 'published'));
  }, [watchlist, catalog]);

  // Content groupings for Netflix-style rows
  const seriesItems = useMemo(() => {
    return filteredCatalog.filter(c => c.type === 'series');
  }, [filteredCatalog]);

  const movieItems = useMemo(() => {
    return filteredCatalog.filter(c => c.type === 'movie');
  }, [filteredCatalog]);

  const trendingItems = filteredCatalog;

  const handlePlay = (item: ContentItem, episodeId?: string) => {
    setPlayingContent({ content: item, episodeId });
  };

  return (
    <div className="tv-safe-container">
      {/* Top Navbar */}
      <Navbar
        activeCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      <main>
        {/* Hero Banner with muted preview trailer on dwell */}
        {featuredItem && (
          <HeroBanner
            item={featuredItem}
            onSelect={setActiveTitle}
            onPlay={handlePlay}
          />
        )}

        {/* Content Rows */}
        <div style={{ position: 'relative', zIndex: 10, marginTop: '-40px' }}>
          {/* Continue Watching Row */}
          {continueWatchingItems.length > 0 && (
            <ContentRow
              title="Continue Watching"
              subtitle="Pick up where you left off"
              items={continueWatchingItems}
              onSelect={setActiveTitle}
              onPlay={handlePlay}
              icon={<Clock size={20} color="#E50914" />}
            />
          )}

          {/* My List / Watchlist */}
          {watchlistItems.length > 0 && (
            <ContentRow
              title="My List"
              subtitle="Saved for your viewing session"
              items={watchlistItems}
              onSelect={setActiveTitle}
              onPlay={handlePlay}
              icon={<Bookmark size={20} color="#E50914" />}
            />
          )}

          {/* TV Shows & Series */}
          {seriesItems.length > 0 && (
            <ContentRow
              title="TV Shows & Series"
              subtitle="Episodic shows and seasons"
              items={seriesItems}
              onSelect={setActiveTitle}
              onPlay={handlePlay}
              icon={<Tv size={20} color="#E50914" />}
            />
          )}

          {/* Movies */}
          {movieItems.length > 0 && (
            <ContentRow
              title="Movies"
              subtitle="Feature films and cinema"
              items={movieItems}
              onSelect={setActiveTitle}
              onPlay={handlePlay}
              icon={<Film size={20} color="#E50914" />}
            />
          )}

          {/* Trending Now */}
          <ContentRow
            title="Trending Now"
            subtitle="Top streamed titles on StreamFlix"
            items={trendingItems}
            onSelect={setActiveTitle}
            onPlay={handlePlay}
            icon={<Flame size={20} color="#E50914" />}
          />
        </div>
      </main>

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          backgroundColor: 'var(--surface)',
          padding: '40px var(--tv-safe-padding-x)',
          marginTop: '60px',
          color: 'var(--text-secondary)',
          fontSize: '13px',
          lineHeight: 1.8
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '32px', marginBottom: '24px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ffffff', fontWeight: 800, fontSize: '16px', marginBottom: '10px' }}>
              <Tv size={20} color="var(--accent)" />
              <span>STREAMHUB HOME STREAMING</span>
            </div>
            <p>
              Your personal home streaming server. Stream any uploaded movie or video on Smart TVs, phones, tablets, or laptops over your Wi-Fi network.
            </p>
          </div>

          <div>
            <h4 style={{ color: '#ffffff', fontWeight: 700, marginBottom: '10px' }}>
              Multi-Device Access
            </h4>
            <p>
              Access from anywhere on your home network via phone camera QR scan or TV browser. Download any movie directly for offline travel.
            </p>
          </div>

          <div>
            <h4 style={{ color: '#ffffff', fontWeight: 700, marginBottom: '10px' }}>
              TV Remote Control
            </h4>
            <p>
              Built-in TV D-Pad directional navigation and on-screen remote control for Smart TVs and couch streaming.
            </p>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <p>© 2026 StreamHub Home Edition. Powered by local storage and direct network streaming.</p>
          <div style={{ display: 'flex', gap: '16px' }}>
            <span style={{ color: '#4ade80' }}>● TV D-Pad Ready</span>
            <span style={{ color: '#60a5fa' }}>● Multi-Device Sync</span>
            <span style={{ color: 'var(--accent)' }}>● Offline Downloads</span>
          </div>
        </div>
      </footer>

      {/* Isolated Video Player Overlay */}
      {playingContent && (
        <VideoPlayer
          content={playingContent.content}
          episodeId={playingContent.episodeId}
          onClose={() => setPlayingContent(null)}
        />
      )}

      {/* Title Details Modal */}
      {activeTitle && (
        <TitleDetailModal
          item={activeTitle}
          onClose={() => setActiveTitle(null)}
          onPlay={handlePlay}
        />
      )}

      {/* Upload Movie Modal */}
      {showUploadModal && (
        <UploadRightsModal
          onClose={() => setShowUploadModal(false)}
        />
      )}

      {/* Subscription Plans & Billing Modal */}
      {showBillingModal && (
        <SubscriptionModal
          onClose={() => setShowBillingModal(false)}
        />
      )}

      {/* Search Modal */}
      {showSearchModal && (
        <SearchModal
          onClose={() => setShowSearchModal(false)}
          onSelect={setActiveTitle}
          onPlay={handlePlay}
        />
      )}

      {/* Offline Downloads Modal */}
      {showDownloadsModal && (
        <DownloadsModal
          onClose={() => setShowDownloadsModal(false)}
          onPlay={handlePlay}
        />
      )}

      {/* Connect TV, Phone, and Other Devices Modal */}
      {showConnectModal && (
        <ConnectDeviceModal
          onClose={() => setShowConnectModal(false)}
        />
      )}
    </div>
  );
};
