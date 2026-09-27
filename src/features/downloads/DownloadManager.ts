import { ContentItem } from '../../types';

export interface OfflineDownloadItem {
  contentId: string;
  title: string;
  posterUrl: string;
  quality: string;
  duration: number;
  downloadedAt: string;
  fileSize: string;
  streamUrl: string;
}

const STORAGE_KEY = 'streamhub_offline_downloads';

export const getOfflineDownloads = (): OfflineDownloadItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const isMovieDownloaded = (contentId: string): boolean => {
  const list = getOfflineDownloads();
  return list.some(item => item.contentId === contentId);
};

export const downloadMovieFile = async (
  item: ContentItem,
  quality: string = '1080p',
  onProgress?: (progress: number) => void
): Promise<void> => {
  return new Promise((resolve) => {
    let currentPct = 0;
    const interval = setInterval(() => {
      currentPct += 20;
      if (onProgress) onProgress(Math.min(100, currentPct));

      if (currentPct >= 100) {
        clearInterval(interval);

        // Record in offline storage
        const currentList = getOfflineDownloads();
        const filtered = currentList.filter(d => d.contentId !== item.id);
        const newItem: OfflineDownloadItem = {
          contentId: item.id,
          title: item.title,
          posterUrl: item.posterUrl,
          quality,
          duration: item.duration,
          downloadedAt: new Date().toISOString(),
          fileSize: quality === '4K' ? '2.4 GB' : quality === '1080p' ? '1.1 GB' : '650 MB',
          streamUrl: item.streamManifestUrl
        };
        filtered.unshift(newItem);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));

        // Trigger real browser file download using backend proxy
        const safeTitle = item.title.replace(/[^a-zA-Z0-9_-]/g, '_');
        const filename = `${safeTitle}-${quality}.mp4`;
        const downloadUrl = `/api/download-proxy?url=${encodeURIComponent(item.streamManifestUrl)}&filename=${encodeURIComponent(filename)}`;

        const anchor = document.createElement('a');
        anchor.href = downloadUrl;
        anchor.download = filename;
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);

        resolve();
      }
    }, 250);
  });
};

export const removeOfflineDownload = (contentId: string) => {
  const currentList = getOfflineDownloads();
  const updated = currentList.filter(d => d.contentId !== contentId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};
