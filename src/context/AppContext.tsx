import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  ContentItem, 
  UserProfile, 
  UserSubscription, 
  WatchHistoryItem, 
  ModerationItem, 
  DmcaNotice, 
  EntitlementTier,
  Episode
} from '../types';
import { 
  INITIAL_CONTENT, 
  INITIAL_PROFILES, 
  INITIAL_USER_SUBSCRIPTION 
} from '../data/mockData';

interface AppContextType {
  // Profiles
  profiles: UserProfile[];
  currentProfile: UserProfile;
  setCurrentProfile: (profile: UserProfile) => void;

  // Subscription & Entitlements
  subscription: UserSubscription;
  upgradeSubscription: (tier: EntitlementTier) => void;
  cancelSubscription: () => void;
  checkEntitlement: (requiredTier: EntitlementTier) => boolean;

  // Catalog
  catalog: ContentItem[];
  watchlist: string[]; // Content IDs
  toggleWatchlist: (contentId: string) => void;
  watchHistory: WatchHistoryItem[];
  updateWatchProgress: (contentId: string, progressSeconds: number, durationSeconds: number, episodeId?: string) => void;
  getResumeProgress: (contentId: string) => WatchHistoryItem | undefined;
  addEpisodeToSeries: (seriesId: string, seasonNumber: number, episode: Episode) => Promise<void>;
  deleteContent: (id: string) => Promise<void>;
  deleteEpisode: (seriesId: string, episodeId: string) => Promise<void>;
  preselectedSeriesId: string | null;
  setPreselectedSeriesId: (id: string | null) => void;

  // Moderation & Upload (Trust & Safety)
  moderationQueue: ModerationItem[];
  dmcaNotices: DmcaNotice[];
  addDirectContent: (newContent: ContentItem) => void;
  submitContentForModeration: (newContent: Omit<ContentItem, 'id' | 'status' | 'viewCount' | 'createdAt' | 'updatedAt'>) => string;
  approveContentUpload: (moderationId: string) => void;
  rejectContentUpload: (moderationId: string, reason: string) => void;
  submitDmcaNotice: (notice: Omit<DmcaNotice, 'id' | 'receivedAt' | 'status'>) => void;
  executeDmcaTakedown: (noticeId: string) => void;

  // TV Mode & Accessibility
  tvMode: boolean;
  setTvMode: (enabled: boolean) => void;
  tvSafeZoneGuide: boolean;
  setTvSafeZoneGuide: (enabled: boolean) => void;
  showRemoteControl: boolean;
  setShowRemoteControl: (show: boolean) => void;

  // Active Modals & Views
  activeTitle: ContentItem | null;
  setActiveTitle: (item: ContentItem | null) => void;
  playingContent: { content: ContentItem; episodeId?: string } | null;
  setPlayingContent: (payload: { content: ContentItem; episodeId?: string } | null) => void;
  showBillingModal: boolean;
  setShowBillingModal: (show: boolean) => void;
  showUploadModal: boolean;
  setShowUploadModal: (show: boolean) => void;
  showModerationModal: boolean;
  setShowModerationModal: (show: boolean) => void;
  showSearchModal: boolean;
  setShowSearchModal: (show: boolean) => void;
  showConnectModal: boolean;
  setShowConnectModal: (show: boolean) => void;
  showDownloadsModal: boolean;
  setShowDownloadsModal: (show: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Profiles
  const [profiles] = useState<UserProfile[]>(INITIAL_PROFILES);
  const [currentProfile, setCurrentProfile] = useState<UserProfile>(INITIAL_PROFILES[0]);

  // Subscription state
  const [subscription, setSubscription] = useState<UserSubscription>(() => {
    const saved = localStorage.getItem('streamhub_subscription');
    return saved ? JSON.parse(saved) : INITIAL_USER_SUBSCRIPTION;
  });

  // Catalog state
  const [catalog, setCatalog] = useState<ContentItem[]>(() => {
    const saved = localStorage.getItem('streamhub_catalog');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const filtered = parsed.filter((c: any) => !c.id.startsWith('sh-orig-') && !c.id.startsWith('sh-lic-') && !c.id.startsWith('sh-ugc-') && !c.id.startsWith('sh-pending-'));
        if (filtered.length > 0) return filtered;
      } catch {}
    }
    return INITIAL_CONTENT;
  });

  // Watchlist state
  const [watchlist, setWatchlist] = useState<string[]>(() => {
    const saved = localStorage.getItem('streamhub_watchlist');
    return saved ? JSON.parse(saved) : [];
  });

  // Watch history
  const [watchHistory, setWatchHistory] = useState<WatchHistoryItem[]>(() => {
    const saved = localStorage.getItem('streamhub_watch_history');
    return saved ? JSON.parse(saved) : [];
  });

  const [preselectedSeriesId, setPreselectedSeriesId] = useState<string | null>(null);

  // Moderation Queue (Trust & Safety)
  const [moderationQueue, setModerationQueue] = useState<ModerationItem[]>(() => {
    const saved = localStorage.getItem('streamhub_moderation');
    return saved ? JSON.parse(saved) : [
      {
        id: 'mod-init-01',
        content: {
          id: 'sh-pending-99',
          title: 'Chronicles of the Red Planet',
          slug: 'chronicles-red-planet',
          type: 'movie',
          synopsis: 'A deep-space exploratory team discovers anomalous ruins on the Martian southern polar cap.',
          duration: 1820,
          releaseYear: 2026,
          rating: 8.2,
          ageRating: 'U/A 13+',
          genres: ['Sci-Fi', 'Documentary'],
          cast: ['Dr. Sarah Miller', 'Aeron Vance'],
          director: 'Elena Kross',
          posterUrl: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=500&auto=format&fit=crop&q=80',
          backdropUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1600&auto=format&fit=crop&q=80',
          bucket: 'licensed',
          licenseRecordId: 'LIC-ORBITAL-DOCS-2026-0044',
          rightsAttestation: {
            attestedBy: 'Orbital DocuWorks International',
            attestedAt: new Date().toISOString(),
            bucket: 'licensed',
            licenseRecordId: 'LIC-ORBITAL-DOCS-2026-0044',
            contractExpiryDate: '2028-12-31T00:00:00Z',
            rightsHolderOrganization: 'Orbital Sciences Media',
            dmcaAccepted: true,
            notes: 'Global digital streaming rights verified under distribution agreement.'
          },
          entitlementTier: 'vip',
          streamManifestUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
          renditions: [
            { quality: '1080p', resolution: '1920x1080', bitrate: '5.0 Mbps', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4' },
            { quality: '720p', resolution: '1280x720', bitrate: '2.5 Mbps', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4' }
          ],
          audioTracks: [{ id: 'en', label: 'English Stereo', language: 'en', isDefault: true }],
          subtitleTracks: [],
          status: 'pending_moderation',
          viewCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        submittedAt: new Date(Date.now() - 14400000).toISOString(),
        status: 'pending'
      }
    ];
  });

  // DMCA Notices (Takedown SLA Tracker)
  const [dmcaNotices, setDmcaNotices] = useState<DmcaNotice[]>(() => {
    const saved = localStorage.getItem('streamhub_dmca');
    return saved ? JSON.parse(saved) : [
      {
        id: 'dmca-sample-01',
        contentId: 'sh-ugc-04',
        contentTitle: 'Big Buck Bunny: The Forest King',
        claimantName: 'Sample Rights Representative',
        claimantEmail: 'legal@animprotect.org',
        copyrightOwner: 'Blender Open Movie Initiative Verification Unit',
        workDescription: 'Verification inquiry regarding original Creative Commons attribution requirements.',
        status: 'pending',
        receivedAt: new Date(Date.now() - 18000000).toISOString()
      }
    ];
  });

  // TV Mode & Accessibility
  const [tvMode, setTvMode] = useState<boolean>(true);
  const [tvSafeZoneGuide, setTvSafeZoneGuide] = useState<boolean>(false);
  const [showRemoteControl, setShowRemoteControl] = useState<boolean>(true);

  // Active View Modals
  const [activeTitle, setActiveTitle] = useState<ContentItem | null>(null);
  const [playingContent, setPlayingContent] = useState<{ content: ContentItem; episodeId?: string } | null>(null);
  const [showBillingModal, setShowBillingModal] = useState<boolean>(false);
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [showModerationModal, setShowModerationModal] = useState<boolean>(false);
  const [showSearchModal, setShowSearchModal] = useState<boolean>(false);
  const [showConnectModal, setShowConnectModal] = useState<boolean>(false);
  const [showDownloadsModal, setShowDownloadsModal] = useState<boolean>(false);

  // Sync custom catalog from server (for cross-device phone/laptop/TV sync)
  useEffect(() => {
    fetch('/api/custom-catalog')
      .then(res => res.json())
      .then((customItems: ContentItem[]) => {
        if (Array.isArray(customItems) && customItems.length > 0) {
          setCatalog(prev => {
            const customMap = new Map(customItems.map(item => [item.id, item]));
            // Update existing items with fresh server data (e.g. .mp4 URLs)
            const updated = prev.map(item => {
              const serverItem = customMap.get(item.id);
              if (serverItem) return serverItem;
              // Clean any stale .mkv reference to .mp4
              if (item.streamManifestUrl?.includes('.mkv')) {
                return {
                  ...item,
                  streamManifestUrl: item.streamManifestUrl.replace(/\.mkv$/i, '.mp4')
                };
              }
              return item;
            });
            // Append any brand new items
            const existingIds = new Set(prev.map(c => c.id));
            const newItems = customItems.filter(item => !existingIds.has(item.id));
            const merged = [...newItems, ...updated];
            localStorage.setItem('streamhub_catalog', JSON.stringify(merged));
            return merged;
          });
        }
      })
      .catch(() => {});
  }, []);

  // Persist storage updates
  useEffect(() => {
    localStorage.setItem('streamhub_subscription', JSON.stringify(subscription));
  }, [subscription]);

  useEffect(() => {
    localStorage.setItem('streamhub_catalog', JSON.stringify(catalog));
  }, [catalog]);

  useEffect(() => {
    localStorage.setItem('streamhub_watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  useEffect(() => {
    localStorage.setItem('streamhub_watch_history', JSON.stringify(watchHistory));
  }, [watchHistory]);

  useEffect(() => {
    localStorage.setItem('streamhub_moderation', JSON.stringify(moderationQueue));
  }, [moderationQueue]);

  useEffect(() => {
    localStorage.setItem('streamhub_dmca', JSON.stringify(dmcaNotices));
  }, [dmcaNotices]);

  // Subscription check logic per RULES.md §1 & ARCHITECTURE.md §3
  const checkEntitlement = (requiredTier: EntitlementTier): boolean => {
    if (requiredTier === 'free') return true;
    if (subscription.status !== 'active') return false;
    if (subscription.planId === 'premium') return true;
    if (subscription.planId === 'vip' && requiredTier === 'vip') return true;
    return false;
  };

  const upgradeSubscription = (tier: EntitlementTier) => {
    setSubscription({
      planId: tier,
      status: 'active',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      cancelAtPeriodEnd: false,
      paymentMethod: 'Visa ending in 4242',
      lastBilledAt: new Date().toISOString()
    });
  };

  const cancelSubscription = () => {
    setSubscription(prev => ({
      ...prev,
      cancelAtPeriodEnd: true
    }));
  };

  const toggleWatchlist = (contentId: string) => {
    setWatchlist(prev => 
      prev.includes(contentId) 
        ? prev.filter(id => id !== contentId) 
        : [...prev, contentId]
    );
  };

  const updateWatchProgress = (
    contentId: string, 
    progressSeconds: number, 
    durationSeconds: number, 
    episodeId?: string
  ) => {
    const targetItem = catalog.find(c => c.id === contentId);
    if (!targetItem) return;

    setWatchHistory(prev => {
      const filtered = prev.filter(item => item.contentId !== contentId);
      return [
        {
          contentId,
          episodeId,
          title: targetItem.title,
          posterUrl: targetItem.posterUrl,
          progressSeconds,
          durationSeconds,
          updatedAt: new Date().toISOString()
        },
        ...filtered
      ];
    });
  };

  const getResumeProgress = (contentId: string) => {
    return watchHistory.find(item => item.contentId === contentId);
  };

  // Add Direct Content (for home streaming without moderation friction)
  const addDirectContent = (newContent: ContentItem) => {
    setCatalog(prev => {
      const filtered = prev.filter(c => c.id !== newContent.id);
      return [newContent, ...filtered];
    });
  };

  // Add Episode to an Existing Series
  const addEpisodeToSeries = async (seriesId: string, seasonNumber: number, episode: Episode) => {
    // 1. Update local catalog state
    setCatalog(prev => prev.map(item => {
      if (item.id === seriesId) {
        const seasons = item.seasons ? [...item.seasons] : [];
        let season = seasons.find(s => s.seasonNumber === seasonNumber);
        if (!season) {
          season = { seasonNumber, title: `Season ${seasonNumber}`, episodes: [] };
          seasons.push(season);
        }
        const updatedEpisodes = season.episodes.filter(e => e.episodeNumber !== episode.episodeNumber);
        updatedEpisodes.push(episode);
        updatedEpisodes.sort((a, b) => a.episodeNumber - b.episodeNumber);
        season.episodes = updatedEpisodes;
        return {
          ...item,
          seasons,
          updatedAt: new Date().toISOString()
        };
      }
      return item;
    }));

    // 2. Also update activeTitle if open
    setActiveTitle(prev => {
      if (prev && prev.id === seriesId) {
        const seasons = prev.seasons ? [...prev.seasons] : [];
        let season = seasons.find(s => s.seasonNumber === seasonNumber);
        if (!season) {
          season = { seasonNumber, title: `Season ${seasonNumber}`, episodes: [] };
          seasons.push(season);
        }
        const updatedEpisodes = season.episodes.filter(e => e.episodeNumber !== episode.episodeNumber);
        updatedEpisodes.push(episode);
        updatedEpisodes.sort((a, b) => a.episodeNumber - b.episodeNumber);
        season.episodes = updatedEpisodes;
        return { ...prev, seasons, updatedAt: new Date().toISOString() };
      }
      return prev;
    });

    // 3. Persist to server backend custom_catalog.json
    try {
      await fetch('/api/add-episode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seriesId, seasonNumber, episode })
      });
    } catch {}
  };

  const deleteContent = async (id: string) => {
    // 1. Remove from local catalog state
    setCatalog(prev => prev.filter(c => c.id !== id));
    setWatchlist(prev => prev.filter(contentId => contentId !== id));
    setWatchHistory(prev => prev.filter(item => item.contentId !== id));

    // 2. Clear active modals if currently viewing or playing
    setActiveTitle(prev => (prev?.id === id ? null : prev));
    setPlayingContent(prev => (prev?.content.id === id ? null : prev));

    // 3. Remove from server custom_catalog.json
    try {
      await fetch('/api/delete-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
    } catch {}
  };

  const deleteEpisode = async (seriesId: string, episodeId: string) => {
    // 1. Update local catalog state
    setCatalog(prev => prev.map(item => {
      if (item.id === seriesId) {
        const seasons = (item.seasons || []).map(s => ({
          ...s,
          episodes: s.episodes.filter(e => e.id !== episodeId)
        }));
        return { ...item, seasons, updatedAt: new Date().toISOString() };
      }
      return item;
    }));

    // 2. Update activeTitle if open
    setActiveTitle(prev => {
      if (prev && prev.id === seriesId) {
        const seasons = (prev.seasons || []).map(s => ({
          ...s,
          episodes: s.episodes.filter(e => e.id !== episodeId)
        }));
        return { ...prev, seasons, updatedAt: new Date().toISOString() };
      }
      return prev;
    });

    // 3. If currently playing this episode, stop playback
    setPlayingContent(prev => {
      if (prev && prev.content.id === seriesId && prev.episodeId === episodeId) {
        return null;
      }
      return prev;
    });

    // 4. Remove from server custom_catalog.json
    try {
      await fetch('/api/delete-episode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seriesId, episodeId })
      });
    } catch {}
  };

  // Submit Content for Upload - Strictly requires Rights Attestation (PRD §6.2)
  const submitContentForModeration = (
    newContentData: Omit<ContentItem, 'id' | 'status' | 'viewCount' | 'createdAt' | 'updatedAt'>
  ): string => {
    const newId = `sh-upload-${Date.now()}`;
    const newContent: ContentItem = {
      ...newContentData,
      id: newId,
      status: 'pending_moderation',
      viewCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const newModerationItem: ModerationItem = {
      id: `mod-${Date.now()}`,
      content: newContent,
      submittedAt: new Date().toISOString(),
      status: 'pending'
    };

    setModerationQueue(prev => [newModerationItem, ...prev]);
    return newId;
  };

  // Approve content: simulates automated transcoding pipeline and publishes to catalog
  const approveContentUpload = (moderationId: string) => {
    setModerationQueue(prev => 
      prev.map(item => {
        if (item.id === moderationId) {
          const publishedContent: ContentItem = {
            ...item.content,
            status: 'published',
            updatedAt: new Date().toISOString()
          };
          
          // Publish to catalog
          setCatalog(cat => [publishedContent, ...cat]);

          return {
            ...item,
            status: 'approved',
            reviewedAt: new Date().toISOString(),
            reviewer: 'Trust & Safety Operations',
            content: publishedContent
          };
        }
        return item;
      })
    );
  };

  // Reject content
  const rejectContentUpload = (moderationId: string, reason: string) => {
    setModerationQueue(prev =>
      prev.map(item => {
        if (item.id === moderationId) {
          return {
            ...item,
            status: 'rejected',
            reviewedAt: new Date().toISOString(),
            reviewer: 'Trust & Safety Operations',
            rejectionReason: reason,
            content: {
              ...item.content,
              status: 'rejected'
            }
          };
        }
        return item;
      })
    );
  };

  // Submit DMCA Notice
  const submitDmcaNotice = (noticeData: Omit<DmcaNotice, 'id' | 'receivedAt' | 'status'>) => {
    const newNotice: DmcaNotice = {
      ...noticeData,
      id: `dmca-${Date.now()}`,
      status: 'pending',
      receivedAt: new Date().toISOString()
    };
    setDmcaNotices(prev => [newNotice, ...prev]);
  };

  // Execute DMCA Takedown under PRD §7 SLA (< 24h)
  const executeDmcaTakedown = (noticeId: string) => {
    setDmcaNotices(prev =>
      prev.map(notice => {
        if (notice.id === noticeId) {
          // Immediately remove/takedown from public catalog
          setCatalog(cat => cat.filter(c => c.id !== notice.contentId));
          return {
            ...notice,
            status: 'takedown_executed',
            resolvedAt: new Date().toISOString(),
            actionTaken: 'Content de-indexed from catalog and CDN cache invalidated per DMCA statutory notice.'
          };
        }
        return notice;
      })
    );
  };

  return (
    <AppContext.Provider
      value={{
        profiles,
        currentProfile,
        setCurrentProfile,
        subscription,
        upgradeSubscription,
        cancelSubscription,
        checkEntitlement,
        catalog,
        watchlist,
        toggleWatchlist,
        watchHistory,
        updateWatchProgress,
        getResumeProgress,
        addEpisodeToSeries,
        deleteContent,
        deleteEpisode,
        preselectedSeriesId,
        setPreselectedSeriesId,
        moderationQueue,
        dmcaNotices,
        addDirectContent,
        submitContentForModeration,
        approveContentUpload,
        rejectContentUpload,
        submitDmcaNotice,
        executeDmcaTakedown,
        tvMode,
        setTvMode,
        tvSafeZoneGuide,
        setTvSafeZoneGuide,
        showRemoteControl,
        setShowRemoteControl,
        activeTitle,
        setActiveTitle,
        playingContent,
        setPlayingContent,
        showBillingModal,
        setShowBillingModal,
        showUploadModal,
        setShowUploadModal,
        showModerationModal,
        setShowModerationModal,
        showSearchModal,
        setShowSearchModal,
        showConnectModal,
        setShowConnectModal,
        showDownloadsModal,
        setShowDownloadsModal
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
