import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import fs from 'fs';

function auditLogsApiPlugin(): Plugin {
  return {
    name: 'audit-logs-api-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url) return next();
        const url = new URL(req.url, 'http://localhost');
        if (url.pathname === '/api/audit-logs') {
          if (req.method === 'GET') {
            const code = (url.searchParams.get('code') || 'DELI01474').toUpperCase();
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 200;
            try {
              const auditFilePath = path.resolve(__dirname, 'database/parcels.json');
              if (fs.existsSync(auditFilePath)) {
                const parcelsRaw = JSON.parse(fs.readFileSync(auditFilePath, 'utf-8'));
                const p = parcelsRaw.parcels && parcelsRaw.parcels[code];
                if (p) {
                  res.end(JSON.stringify({ status: 'ok', parcel: p }));
                  return;
                }
              }
            } catch {}
            res.end(JSON.stringify({ status: 'ok', code }));
            return;
          }
          if (req.method === 'POST') {
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 201;
            res.end(JSON.stringify({ status: 'recorded' }));
            return;
          }
        }
        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), auditLogsApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
