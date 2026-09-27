import React, { useState, useEffect } from 'react';
import { X, Download, Play, Trash2, HardDrive } from 'lucide-react';
import { OfflineDownloadItem, getOfflineDownloads, removeOfflineDownload } from './DownloadManager';
import { ContentItem } from '../../types';
import { useApp } from '../../context/AppContext';

interface DownloadsModalProps {
  onClose: () => void;
  onPlay: (item: ContentItem) => void;
}

export const DownloadsModal: React.FC<DownloadsModalProps> = ({ onClose, onPlay }) => {
  const { catalog } = useApp();
  const [downloads, setDownloads] = useState<OfflineDownloadItem[]>([]);

  useEffect(() => {
    setDownloads(getOfflineDownloads());
  }, []);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleDelete = (contentId: string) => {
    removeOfflineDownload(contentId);
    setDownloads(getOfflineDownloads());
  };

  const handlePlayDownloaded = (download: OfflineDownloadItem) => {
    const item = catalog.find(c => c.id === download.contentId);
    if (item) {
      onPlay(item);
      onClose();
    }
  };

  return (
    <div
      role="dialog"
      aria-label="Offline Downloads"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9600,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(20px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px'
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '780px',
          maxHeight: '85vh',
          backgroundColor: '#181818',
          borderRadius: '12px',
          overflowY: 'auto',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          padding: '32px',
          boxShadow: '0 24px 70px rgba(0, 0, 0, 0.95)'
        }}
        className="slide-up"
      >
        {/* Prominent High-Contrast Close Button */}
        <button
          onClick={onClose}
          className="tv-focusable"
          data-tv-focus="true"
          title="Close (Esc)"
          aria-label="Close"
          style={{ 
            position: 'absolute', 
            top: '18px', 
            right: '18px', 
            borderRadius: '50%', 
            width: '40px', 
            height: '40px',
            backgroundColor: '#262626',
            border: '2px solid rgba(255, 255, 255, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.6)'
          }}
        >
          <X size={22} color="#ffffff" strokeWidth={2.5} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <Download size={24} color="#E50914" />
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#ffffff' }}>
            Offline Downloads
          </h2>
        </div>
        <p style={{ fontSize: '13px', color: '#a3a3a3', marginBottom: '24px' }}>
          Movies and series downloaded to your device for offline viewing without internet.
        </p>

        {downloads.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 20px', backgroundColor: '#232323', borderRadius: '8px' }}>
            <HardDrive size={40} color="#666666" style={{ margin: '0 auto 12px auto' }} />
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px', color: '#ffffff' }}>No Downloaded Movies</h3>
            <p style={{ fontSize: '13px', color: '#a3a3a3' }}>
              Click the "Download" button on any movie card or player to save it for offline playback.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {downloads.map(item => (
              <div
                key={item.contentId}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: '#232323',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  border: '1px solid rgba(255, 255, 255, 0.08)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <img
                    src={item.posterUrl || 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=500&auto=format&fit=crop&q=80'}
                    alt={item.title}
                    style={{ width: '48px', height: '64px', borderRadius: '4px', objectFit: 'cover' }}
                  />
                  <div>
                    <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '4px', color: '#ffffff' }}>
                      {item.title}
                    </h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#a3a3a3' }}>
                      <span style={{ fontSize: '10px', backgroundColor: '#E50914', color: '#ffffff', padding: '1px 6px', borderRadius: '2px', fontWeight: 700 }}>
                        {item.quality}
                      </span>
                      <span>{item.fileSize}</span>
                      <span>•</span>
                      <span>Saved {new Date(item.downloadedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button
                    onClick={() => handlePlayDownloaded(item)}
                    className="btn tv-focusable"
                    data-tv-focus="true"
                    style={{ 
                      padding: '8px 16px', 
                      fontSize: '13px', 
                      fontWeight: 700,
                      backgroundColor: '#E50914',
                      color: '#ffffff',
                      borderRadius: '4px',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    <Play size={14} fill="#ffffff" />
                    <span>Watch Offline</span>
                  </button>

                  <button
                    onClick={() => handleDelete(item.contentId)}
                    className="btn btn-ghost tv-focusable"
                    data-tv-focus="true"
                    title="Delete download"
                    style={{ color: '#ef4444', padding: '8px', cursor: 'pointer' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bottom Explicit Close Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '16px' }}>
          <button
            onClick={onClose}
            className="btn btn-secondary tv-focusable"
            data-tv-focus="true"
            style={{ padding: '10px 24px', fontSize: '14px', fontWeight: 700 }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
