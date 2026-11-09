import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import searchHandler from './api/search.js';
import telegramHandler from './api/telegram.js';
import cronHandler from './api/cron.js';

function vercelApiDevPlugin() {
  return {
    name: 'vercel-api-dev',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url.startsWith('/api/')) {
          return next();
        }

        const getBody = () =>
          new Promise((resolve) => {
            if (req.method === 'GET' || req.method === 'HEAD') return resolve({});
            let data = '';
            req.on('data', (chunk) => {
              data += chunk;
            });
            req.on('end', () => {
              try {
                resolve(data ? JSON.parse(data) : {});
              } catch {
                resolve({});
              }
            });
            req.on('error', () => resolve({}));
          });

        const body = await getBody();

        const vercelRes = {
          status(code) {
            res.statusCode = code;
            return this;
          },
          json(data) {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(data));
            return this;
          }
        };

        const vercelReq = {
          method: req.method,
          url: req.url,
          headers: req.headers,
          body,
          query: Object.fromEntries(new URL(req.url, 'http://localhost').searchParams)
        };

        try {
          if (req.url.startsWith('/api/search')) {
            return await searchHandler(vercelReq, vercelRes);
          }
          if (req.url.startsWith('/api/telegram')) {
            return await telegramHandler(vercelReq, vercelRes);
          }
          if (req.url.startsWith('/api/cron')) {
            return await cronHandler(vercelReq, vercelRes);
          }
        } catch (err) {
          console.error('API Dev Middleware Error:', err);
          return vercelRes.status(500).json({ error: err.message });
        }

        next();
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    vercelApiDevPlugin()
  ],
  server: {
    port: 5188,
    host: true,
    watch: {
      ignored: [
        '**/bus_details.html',
        '**/*.txt',
        '**/*.log',
        '**/*.py',
        '**/.git/**',
        '**/dist/**',
        '**/.venv/**'
      ]
    }
  }
});
