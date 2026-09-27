import React, { useState, useEffect } from 'react';
import { 
  X, 
  Smartphone, 
  Tv, 
  Laptop, 
  Globe, 
  Copy, 
  Check, 
  Wifi, 
  ExternalLink 
} from 'lucide-react';
import { QrCodeSvg } from './QrCodeSvg';

interface ConnectDeviceModalProps {
  onClose: () => void;
}

export const ConnectDeviceModal: React.FC<ConnectDeviceModalProps> = ({ onClose }) => {
  const [networkUrl, setNetworkUrl] = useState<string>('http://192.168.0.100:3001');
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'phone' | 'tv' | 'laptop' | 'remote'>('phone');

  useEffect(() => {
    fetch('/api/network-info')
      .then(res => res.json())
      .then(data => {
        if (data.networkUrl) setNetworkUrl(data.networkUrl);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const copyUrl = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div
      role="dialog"
      aria-label="Connect TV, Phone & Other Devices"
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
          maxWidth: '820px',
          maxHeight: '90vh',
          backgroundColor: '#181818',
          borderRadius: '12px',
          overflowY: 'auto',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          padding: '36px',
          boxShadow: '0 24px 70px rgba(0, 0, 0, 0.95)'
        }}
        className="slide-up"
      >
        <button
          onClick={onClose}
          className="tv-focusable"
          data-tv-focus="true"
          title="Close (Esc)"
          aria-label="Close"
          style={{ 
            position: 'absolute', 
            top: '20px', 
            right: '20px', 
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
          <Wifi size={24} color="var(--accent)" />
          <h2 style={{ fontSize: '24px', fontWeight: 800 }}>
            Connect Phone, TV & Other Devices
          </h2>
        </div>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
          Access StreamHub from your smartphone, tablet, Smart TV, or another computer from anywhere on your Wi-Fi network.
        </p>

        {/* Network Address Banner */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--surface-raised)',
            border: '1px solid var(--accent)',
            borderRadius: '8px',
            padding: '14px 20px',
            marginBottom: '28px',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              LOCAL NETWORK STREAMING URL
            </div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff', fontFamily: 'monospace', marginTop: '2px' }}>
              {networkUrl}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => copyUrl(networkUrl)}
              className="btn btn-secondary tv-focusable"
              data-tv-focus="true"
              style={{ padding: '8px 14px', fontSize: '13px' }}
            >
              {copied ? <Check size={14} color="#4ade80" /> : <Copy size={14} />}
              <span>{copied ? 'Copied!' : 'Copy URL'}</span>
            </button>

            <a
              href={networkUrl}
              target="_blank"
              rel="noreferrer"
              className="btn btn-primary tv-focusable"
              data-tv-focus="true"
              style={{ padding: '8px 14px', fontSize: '13px' }}
            >
              <ExternalLink size={14} />
              <span>Open in New Tab</span>
            </a>
          </div>
        </div>

        {/* Device Type Tabs */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px', marginBottom: '24px' }}>
          <button
            onClick={() => setActiveTab('phone')}
            className="tv-focusable"
            data-tv-focus="true"
            style={{
              padding: '8px 14px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: activeTab === 'phone' ? 'var(--accent)' : 'transparent',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Smartphone size={16} />
            <span>Phone / Tablet</span>
          </button>

          <button
            onClick={() => setActiveTab('tv')}
            className="tv-focusable"
            data-tv-focus="true"
            style={{
              padding: '8px 14px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: activeTab === 'tv' ? 'var(--accent)' : 'transparent',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Tv size={16} />
            <span>Smart TV</span>
          </button>

          <button
            onClick={() => setActiveTab('laptop')}
            className="tv-focusable"
            data-tv-focus="true"
            style={{
              padding: '8px 14px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: activeTab === 'laptop' ? 'var(--accent)' : 'transparent',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Laptop size={16} />
            <span>Another Laptop</span>
          </button>

          <button
            onClick={() => setActiveTab('remote')}
            className="tv-focusable"
            data-tv-focus="true"
            style={{
              padding: '8px 14px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: activeTab === 'remote' ? 'var(--accent)' : 'transparent',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Globe size={16} />
            <span>Anywhere (Cellular / Outside)</span>
          </button>
        </div>

        {/* Tab 1: Phone / Tablet with Scan QR Code */}
        {activeTab === 'phone' && (
          <div style={{ display: 'flex', gap: '32px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ backgroundColor: '#ffffff', padding: '12px', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <QrCodeSvg text={networkUrl} size={180} />
              <span style={{ fontSize: '11px', color: '#333333', fontWeight: 700, marginTop: '6px' }}>
                Scan with Camera
              </span>
            </div>

            <div style={{ flex: 1, minWidth: '260px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '10px' }}>
                How to Watch on Mobile
              </h3>
              <ol style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                <li>Make sure your phone is connected to the same Wi-Fi network.</li>
                <li>Open your smartphone camera (iOS or Android) and point it at the QR code.</li>
                <li>Tap the prompt that appears to open <strong>StreamHub</strong> in Safari or Chrome.</li>
                <li>You can stream movies, watch uploaded videos, or download them directly to your phone storage!</li>
              </ol>
            </div>
          </div>
        )}

        {/* Tab 2: Smart TV */}
        {activeTab === 'tv' && (
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '12px' }}>
              How to Open on Smart TV (Android TV, Fire TV, Samsung, LG)
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              <div style={{ backgroundColor: 'var(--surface-raised)', padding: '16px', borderRadius: '8px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--accent)', marginBottom: '6px' }}>
                  1. Fire TV & Android TV
                </h4>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Open the <strong>Amazon Silk</strong> browser or <strong>Chrome / Puffin</strong> app on your TV, and type:
                  <br />
                  <code style={{ color: '#ffffff', fontWeight: 700 }}>{networkUrl}</code>
                </p>
              </div>

              <div style={{ backgroundColor: 'var(--surface-raised)', padding: '16px', borderRadius: '8px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--accent)', marginBottom: '6px' }}>
                  2. Samsung / LG TV
                </h4>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Open the built-in <strong>Web Browser</strong> from your TV home bar, and enter the address above. D-Pad TV mode will work with your remote!
                </p>
              </div>

              <div style={{ backgroundColor: 'var(--surface-raised)', padding: '16px', borderRadius: '8px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#4ade80', marginBottom: '6px' }}>
                  3. Pairing PIN
                </h4>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Optional Fast-Connect PIN:
                  <br />
                  <span style={{ fontSize: '20px', fontWeight: 900, color: '#ffffff', letterSpacing: '2px' }}>TV-8821</span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Another Laptop */}
        {activeTab === 'laptop' && (
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '12px' }}>
              Access from Another Laptop or Desktop
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '16px' }}>
              Any PC, MacBook, Linux laptop, or iPad on your Wi-Fi network can access the platform instantly by typing this address in any browser:
            </p>
            <div style={{ backgroundColor: 'var(--surface-raised)', padding: '16px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <code style={{ fontSize: '16px', color: 'var(--accent)', fontWeight: 700 }}>{networkUrl}</code>
              <button
                onClick={() => copyUrl(networkUrl)}
                className="btn btn-primary tv-focusable"
                data-tv-focus="true"
                style={{ padding: '6px 12px', fontSize: '12px' }}
              >
                Copy Link
              </button>
            </div>
          </div>
        )}

        {/* Tab 4: Outside Home Network */}
        {activeTab === 'remote' && (
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '12px' }}>
              Access from Anywhere Worldwide (4G / 5G / Outside Wi-Fi)
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '16px' }}>
              To stream your uploaded movies when you are away from home on mobile data or at work, you can expose a secure public HTTPS tunnel using Cloudflare or localtunnel:
            </p>
            <div style={{ backgroundColor: '#0d0d14', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '16px', marginBottom: '14px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>TERMINAL COMMAND (Runs instant free public tunnel):</div>
              <code style={{ fontSize: '13px', color: '#4ade80', fontFamily: 'monospace' }}>
                npx localtunnel --port 3001
              </code>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              This gives you a public URL (e.g. <code>https://cool-streamhub.loca.lt</code>) accessible on any device worldwide.
            </p>
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
