import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import os from 'os';
import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';

function getLocalIp(): string {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    const netList = nets[name];
    if (netList) {
      for (const net of netList) {
        if (net.family === 'IPv4' && !net.internal) {
          return net.address;
        }
      }
    }
  }
  return 'localhost';
}

function streamhubBackendPlugin(): Plugin {
  return {
    name: 'streamhub-backend-plugin',
    configureServer(server) {
      const uploadsDir = path.resolve(__dirname, 'public/uploads');
      const catalogFile = path.resolve(uploadsDir, 'custom_catalog.json');

      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      if (!fs.existsSync(catalogFile)) {
        fs.writeFileSync(catalogFile, '[]', 'utf-8');
      }

      // API: Network Info for TV & Phone Access
      server.middlewares.use('/api/network-info', (_req, res) => {
        const ip = getLocalIp();
        const info = {
          localIp: ip,
          port: 3001,
          networkUrl: `http://${ip}:3001`,
          devicePairingCode: 'TV-8821'
        };
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(info));
      });

      // API: Custom Catalog
      server.middlewares.use('/api/custom-catalog', (req, res) => {
        if (req.method === 'GET') {
          try {
            const data = fs.readFileSync(catalogFile, 'utf-8');
            res.setHeader('Content-Type', 'application/json');
            res.end(data);
          } catch {
            res.setHeader('Content-Type', 'application/json');
            res.end('[]');
          }
        }
      });

      // API: Upload Movie
      server.middlewares.use('/api/upload-movie', (req, res) => {
        if (req.method === 'POST') {
          const contentType = req.headers['content-type'] || '';
          
          if (contentType.includes('application/json')) {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
              try {
                const payload = JSON.parse(body);
                const currentData: any[] = JSON.parse(fs.readFileSync(catalogFile, 'utf-8'));
                // Deduplicate by id or streamManifestUrl
                const filtered = currentData.filter(item => item.id !== payload.id && item.streamManifestUrl !== payload.streamManifestUrl);
                filtered.unshift(payload);
                fs.writeFileSync(catalogFile, JSON.stringify(filtered, null, 2), 'utf-8');
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: true, item: payload }));
              } catch (err: unknown) {
                res.statusCode = 500;
                res.end(JSON.stringify({ error: String(err) }));
              }
            });
          } else {
            // Binary or stream video upload
            const urlObj = new URL(req.url || '', `http://${req.headers.host}`);
            const filename = urlObj.searchParams.get('filename') || `video-${Date.now()}.mp4`;
            const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
            const targetPath = path.resolve(uploadsDir, safeName);
            const writeStream = fs.createWriteStream(targetPath);

            req.pipe(writeStream);
            writeStream.on('finish', () => {
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ 
                success: true, 
                url: `/uploads/${safeName}`, 
                filename: safeName 
              }));
            });
            writeStream.on('error', (err) => {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: err.message }));
            });
          }
        }
      });

      // API: Add Episode to Existing Series
      server.middlewares.use('/api/add-episode', (req, res) => {
        if (req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const { seriesId, seasonNumber, episode } = JSON.parse(body);
              const currentData: any[] = JSON.parse(fs.readFileSync(catalogFile, 'utf-8'));
              const targetSeries = currentData.find(item => item.id === seriesId);
              if (targetSeries) {
                if (!targetSeries.seasons) targetSeries.seasons = [];
                let targetSeason = targetSeries.seasons.find((s: any) => s.seasonNumber === seasonNumber);
                if (!targetSeason) {
                  targetSeason = { seasonNumber, title: `Season ${seasonNumber}`, episodes: [] };
                  targetSeries.seasons.push(targetSeason);
                }
                // Deduplicate by episodeNumber
                targetSeason.episodes = targetSeason.episodes.filter((e: any) => e.episodeNumber !== episode.episodeNumber);
                targetSeason.episodes.push(episode);
                targetSeason.episodes.sort((a: any, b: any) => a.episodeNumber - b.episodeNumber);
                fs.writeFileSync(catalogFile, JSON.stringify(currentData, null, 2), 'utf-8');
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: true, series: targetSeries }));
                return;
              }
              res.statusCode = 404;
              res.end(JSON.stringify({ error: 'Series not found' }));
            } catch (err) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: String(err) }));
            }
          });
        }
      });

      // API: Delete Movie or Series
      server.middlewares.use('/api/delete-content', (req, res) => {
        if (req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const { id } = JSON.parse(body);
              if (!id) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'Missing id' }));
                return;
              }
              const currentData: any[] = JSON.parse(fs.readFileSync(catalogFile, 'utf-8'));
              const targetItem = currentData.find(item => item.id === id);
              const filtered = currentData.filter(item => item.id !== id);
              fs.writeFileSync(catalogFile, JSON.stringify(filtered, null, 2), 'utf-8');

              // If streamManifestUrl points to /uploads/..., remove video file from disk
              if (targetItem?.streamManifestUrl?.startsWith('/uploads/')) {
                const localFileName = targetItem.streamManifestUrl.replace('/uploads/', '');
                const filePath = path.resolve(uploadsDir, localFileName);
                if (fs.existsSync(filePath)) {
                  try { fs.unlinkSync(filePath); } catch {}
                }
              }

              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, deletedId: id }));
            } catch (err) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: String(err) }));
            }
          });
        }
      });

      // API: Delete Episode from Series
      server.middlewares.use('/api/delete-episode', (req, res) => {
        if (req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const { seriesId, episodeId } = JSON.parse(body);
              const currentData: any[] = JSON.parse(fs.readFileSync(catalogFile, 'utf-8'));
              const targetSeries = currentData.find(item => item.id === seriesId);
              if (targetSeries && targetSeries.seasons) {
                for (const season of targetSeries.seasons) {
                  const targetEp = season.episodes?.find((e: any) => e.id === episodeId);
                  if (targetEp) {
                    season.episodes = season.episodes.filter((e: any) => e.id !== episodeId);
                    if (targetEp.streamUrl?.startsWith('/uploads/')) {
                      const localFileName = targetEp.streamUrl.replace('/uploads/', '');
                      const filePath = path.resolve(uploadsDir, localFileName);
                      if (fs.existsSync(filePath)) {
                        try { fs.unlinkSync(filePath); } catch {}
                      }
                    }
                  }
                }
                fs.writeFileSync(catalogFile, JSON.stringify(currentData, null, 2), 'utf-8');
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: true, series: targetSeries }));
                return;
              }
              res.statusCode = 404;
              res.end(JSON.stringify({ error: 'Series or episode not found' }));
            } catch (err) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: String(err) }));
            }
          });
        }
      });

      // API: Direct Movie Download Proxy with Content-Disposition Attachment
      server.middlewares.use('/api/download-proxy', (req, res) => {
        const urlObj = new URL(req.url || '', `http://${req.headers.host}`);
        const targetUrl = urlObj.searchParams.get('url');
        const filename = urlObj.searchParams.get('filename') || 'streamhub-movie.mp4';

        if (!targetUrl) {
          res.statusCode = 400;
          res.end('Missing target url');
          return;
        }

        // If local file path
        if (targetUrl.startsWith('/uploads/')) {
          const localFilePath = path.resolve(uploadsDir, path.basename(targetUrl));
          if (fs.existsSync(localFilePath)) {
            const ext = path.extname(localFilePath).toLowerCase();
            const mimeMap: Record<string, string> = {
              '.mp4': 'video/mp4',
              '.mkv': 'video/x-matroska',
              '.webm': 'video/webm',
              '.mov': 'video/quicktime',
              '.avi': 'video/x-msvideo'
            };
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.setHeader('Content-Type', mimeMap[ext] || 'application/octet-stream');
            fs.createReadStream(localFilePath).pipe(res);
            return;
          }
        }

        // If external remote URL (e.g. Google Storage sample video)
        try {
          const client = targetUrl.startsWith('https') ? https : http;
          client.get(targetUrl, (proxyRes) => {
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.setHeader('Content-Type', proxyRes.headers['content-type'] || 'video/mp4');
            if (proxyRes.headers['content-length']) {
              res.setHeader('Content-Length', proxyRes.headers['content-length']);
            }
            proxyRes.pipe(res);
          }).on('error', (err) => {
            res.statusCode = 500;
            res.end(`Download error: ${err.message}`);
          });
        } catch (err: unknown) {
          res.statusCode = 500;
          res.end(`Download error: ${String(err)}`);
        }
      });
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), streamhubBackendPlugin()],
  server: {
    port: 3001,
    host: '0.0.0.0' // binds to all network interfaces for phone/TV access
  }
});
