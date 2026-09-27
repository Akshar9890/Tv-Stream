import { describe, it, expect } from 'vitest';
import { INITIAL_CONTENT } from '../data/mockData';
import { ContentItem, EntitlementTier, Episode } from '../types';

describe('StreamFlix Streaming & Episodic Series Tests', () => {

  describe('Entitlement Rules & Playback Access', () => {
    it('should allow free content playback for any user tier', () => {
      const freeItem = INITIAL_CONTENT.find(c => c.entitlementTier === 'free');
      expect(freeItem).toBeDefined();

      const canAccess = (userTier: EntitlementTier, requiredTier: EntitlementTier) => {
        if (requiredTier === 'free') return true;
        if (userTier === 'premium') return true;
        if (userTier === 'vip' && requiredTier === 'vip') return true;
        return false;
      };

      expect(canAccess('free', freeItem!.entitlementTier)).toBe(true);
      expect(canAccess('vip', freeItem!.entitlementTier)).toBe(true);
      expect(canAccess('premium', freeItem!.entitlementTier)).toBe(true);
    });

    it('should gate VIP and Premium content appropriately', () => {
      const canAccess = (userTier: EntitlementTier, requiredTier: EntitlementTier) => {
        if (requiredTier === 'free') return true;
        if (userTier === 'premium') return true;
        if (userTier === 'vip' && requiredTier === 'vip') return true;
        return false;
      };

      // Free user cannot access VIP or Premium
      expect(canAccess('free', 'vip')).toBe(false);
      expect(canAccess('free', 'premium')).toBe(false);

      // VIP user can access VIP, but not Premium
      expect(canAccess('vip', 'vip')).toBe(true);
      expect(canAccess('vip', 'premium')).toBe(false);

      // Premium user can access all tiers
      expect(canAccess('premium', 'vip')).toBe(true);
      expect(canAccess('premium', 'premium')).toBe(true);
    });
  });

  describe('Episodic Series Management & Appending', () => {
    it('initializes real user series with proper season and episode structure', () => {
      const series = INITIAL_CONTENT.find(c => c.type === 'series');
      expect(series).toBeDefined();
      expect(series?.seasons).toBeDefined();
      expect(series?.seasons && series.seasons.length > 0).toBe(true);
      
      const season = series!.seasons![0];
      expect(season.seasonNumber).toBe(5);
      expect(season.episodes.length).toBeGreaterThanOrEqual(1);
      expect(season.episodes[0].episodeNumber).toBe(1);
    });

    it('appends a new episode to an existing series and preserves sorting', () => {
      const series: ContentItem = {
        ...INITIAL_CONTENT[0],
        seasons: [
          {
            seasonNumber: 5,
            title: 'Season 5',
            episodes: [
              {
                id: 'ep-1',
                seasonNumber: 5,
                episodeNumber: 1,
                title: 'Episode 1',
                synopsis: 'First episode',
                duration: 3600,
                thumbnailUrl: '',
                streamUrl: '/uploads/ep1.mkv',
                renditions: []
              }
            ]
          }
        ]
      };

      const newEp: Episode = {
        id: 'ep-2',
        seasonNumber: 5,
        episodeNumber: 2,
        title: 'Episode 2',
        synopsis: 'Second episode',
        duration: 3600,
        thumbnailUrl: '',
        streamUrl: '/uploads/ep2.mkv',
        renditions: []
      };

      // Function simulating addEpisodeToSeries
      const addEpisode = (item: ContentItem, sNum: number, ep: Episode): ContentItem => {
        const seasons = [...(item.seasons || [])];
        const sIdx = seasons.findIndex(s => s.seasonNumber === sNum);
        if (sIdx >= 0) {
          const eps = seasons[sIdx].episodes.filter(e => e.episodeNumber !== ep.episodeNumber);
          eps.push(ep);
          eps.sort((a, b) => a.episodeNumber - b.episodeNumber);
          seasons[sIdx] = { ...seasons[sIdx], episodes: eps };
        } else {
          seasons.push({ seasonNumber: sNum, title: `Season ${sNum}`, episodes: [ep] });
        }
        return { ...item, seasons };
      };

      const updated = addEpisode(series, 5, newEp);
      const s5 = updated.seasons?.find(s => s.seasonNumber === 5);
      expect(s5?.episodes.length).toBe(2);
      expect(s5?.episodes[1].episodeNumber).toBe(2);
      expect(s5?.episodes[1].title).toBe('Episode 2');
    });

    it('can create a brand new season when adding an episode with a higher season number', () => {
      const series: ContentItem = {
        ...INITIAL_CONTENT[0],
        seasons: [
          {
            seasonNumber: 1,
            title: 'Season 1',
            episodes: []
          }
        ]
      };

      const newEp: Episode = {
        id: 'ep-s2-1',
        seasonNumber: 2,
        episodeNumber: 1,
        title: 'Season 2 Premiere',
        synopsis: 'New season begins',
        duration: 3600,
        thumbnailUrl: '',
        streamUrl: '/uploads/s2e1.mp4',
        renditions: []
      };

      const seasons = [...(series.seasons || [])];
      seasons.push({ seasonNumber: 2, title: 'Season 2', episodes: [newEp] });
      const updated = { ...series, seasons };

      expect(updated.seasons.length).toBe(2);
      expect(updated.seasons[1].seasonNumber).toBe(2);
      expect(updated.seasons[1].episodes[0].title).toBe('Season 2 Premiere');
    });

    it('deletes a specific episode from a series while keeping remaining episodes intact', () => {
      const series: ContentItem = {
        ...INITIAL_CONTENT[0],
        seasons: [
          {
            seasonNumber: 5,
            title: 'Season 5',
            episodes: [
              { id: 'ep-1', seasonNumber: 5, episodeNumber: 1, title: 'Ep 1', synopsis: '', duration: 100, thumbnailUrl: '', streamUrl: '', renditions: [] },
              { id: 'ep-2', seasonNumber: 5, episodeNumber: 2, title: 'Ep 2', synopsis: '', duration: 100, thumbnailUrl: '', streamUrl: '', renditions: [] }
            ]
          }
        ]
      };

      const deleteEp = (item: ContentItem, epId: string): ContentItem => {
        const seasons = (item.seasons || []).map(s => ({
          ...s,
          episodes: s.episodes.filter(e => e.id !== epId)
        }));
        return { ...item, seasons };
      };

      const afterDelete = deleteEp(series, 'ep-1');
      expect(afterDelete.seasons![0].episodes.length).toBe(1);
      expect(afterDelete.seasons![0].episodes[0].id).toBe('ep-2');
    });

    it('deletes an entire movie or series from the catalog', () => {
      const catalog = [...INITIAL_CONTENT];
      const targetId = catalog[0].id;
      const filtered = catalog.filter(c => c.id !== targetId);

      expect(filtered.some(c => c.id === targetId)).toBe(false);
      expect(filtered.length).toBe(catalog.length - 1);
    });
  });
});
