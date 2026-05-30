import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { SYSTEM } from './api/chat.js'

// Local dev-only middleware that mirrors the Vercel Edge Function at api/chat.js.
// Only active during `npm run dev`; removed from the production build entirely.
function localChatApi(groqKey) {
  return {
    name: 'local-chat-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/api/chat', async (req, res) => {
        if (req.method === 'OPTIONS') {
          res.writeHead(204, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
          });
          res.end();
          return;
        }

        if (req.method !== 'POST') {
          res.writeHead(405);
          res.end('Method Not Allowed');
          return;
        }

        let body;
        try {
          body = await new Promise((resolve, reject) => {
            let raw = '';
            req.on('data', c => (raw += c));
            req.on('end', () => { try { resolve(JSON.parse(raw)); } catch { reject(); } });
            req.on('error', reject);
          });
        } catch {
          res.writeHead(400);
          res.end('Bad Request');
          return;
        }

        const history = Array.isArray(body.messages) ? body.messages.slice(-8) : [];

        let groqRes;
        try {
          groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${groqKey}`,
            },
            body: JSON.stringify({
              model: 'llama-3.3-70b-versatile',
              messages: [{ role: 'system', content: SYSTEM }, ...history],
              stream: true,
              max_tokens: 200,
              temperature: 0.75,
            }),
          });
        } catch {
          res.writeHead(502);
          res.end('Service unavailable');
          return;
        }

        if (!groqRes.ok) {
          res.writeHead(502);
          res.end('Upstream error');
          return;
        }

        res.writeHead(200, {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Access-Control-Allow-Origin': '*',
        });

        const reader = groqRes.body.getReader();
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            res.write(value);
          }
        } finally {
          res.end();
        }
      });
    },
  };
}

function localVisitorsApi(redisUrl, redisToken) {
  // UA parsers (mirrors api/visitors.js — Node IncomingMessage uses header object, not .get())
  function parseRefDomain(ref) {
    if (!ref) return 'direct';
    try { return new URL(ref).hostname.replace(/^www\./, '') || 'direct'; } catch { return 'direct'; }
  }
  function parseDevice(ua) {
    if (!ua) return 'unknown';
    if (/Mobile|Android|iPhone|iPod/i.test(ua)) return 'mobile';
    if (/iPad|Tablet/i.test(ua)) return 'tablet';
    return 'desktop';
  }
  function parseBrowser(ua) {
    if (!ua) return 'unknown';
    if (/Edg\//i.test(ua)) return 'Edge';
    if (/Chrome\//i.test(ua)) return 'Chrome';
    if (/Firefox\//i.test(ua)) return 'Firefox';
    if (/Safari\//i.test(ua)) return 'Safari';
    return 'other';
  }
  function parseOS(ua) {
    if (!ua) return 'unknown';
    if (/Windows/i.test(ua)) return 'Windows';
    if (/Android/i.test(ua)) return 'Android';
    if (/iPhone|iPad|iOS/i.test(ua)) return 'iOS';
    if (/Mac OS X/i.test(ua)) return 'macOS';
    if (/Linux/i.test(ua)) return 'Linux';
    return 'other';
  }

  return {
    name: 'local-visitors-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/api/visitors', async (req, res) => {
        if (req.method === 'OPTIONS') {
          res.writeHead(204, { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, OPTIONS' });
          res.end();
          return;
        }

        const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };
        const MIN_COUNT = 500;

        if (!redisUrl || !redisToken) {
          res.writeHead(200, headers);
          res.end(JSON.stringify({ count: MIN_COUNT }));
          return;
        }

        async function redis(cmd, ...args) {
          const path = [cmd, ...args].map(encodeURIComponent).join('/');
          const r = await fetch(`${redisUrl}/${path}`, {
            headers: { Authorization: `Bearer ${redisToken}` },
          });
          const { result } = await r.json();
          return result;
        }

        async function redisPipeline(commands) {
          await fetch(`${redisUrl}/pipeline`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${redisToken}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(commands),
          });
        }

        const ip = req.socket?.remoteAddress ?? '127.0.0.1';
        const totalKey = 'portfolio:visits:total';
        const ipKey = `portfolio:visits:ip:dev:${ip}`;

        const isNew = !(await redis('get', ipKey));
        let count;
        if (isNew) {
          await redis('setex', ipKey, '300', '1'); // 5-min TTL in dev
          count = Number(await redis('incr', totalKey));
        } else {
          count = parseInt(await redis('get', totalKey), 10) || 0;
        }
        if (count < MIN_COUNT) {
          await redis('set', totalKey, String(MIN_COUNT));
          count = MIN_COUNT;
        }

        // Analytics — Node headers via object access, dev log key isolated from prod
        const ua = req.headers['user-agent'] ?? '';
        const referer = req.headers['referer'] ?? '';
        const ts = Date.now();
        const day = new Date().toISOString().slice(0, 10);
        const ref = parseRefDomain(referer);
        const device = parseDevice(ua);
        const browser = parseBrowser(ua);
        const os = parseOS(ua);

        const payload = JSON.stringify({ ts, country: 'XX', city: 'dev', ref, device, browser, os, new: isNew });
        const DEV_LOG = 'portfolio:visits:log:dev';

        const writes = [
          ['ZADD', DEV_LOG, String(ts), payload],
          ['ZREMRANGEBYRANK', DEV_LOG, '0', '-5001'],
        ];
        if (isNew) {
          writes.push(
            ['INCR', `portfolio:stats:country:XX`],
            ['INCR', `portfolio:stats:device:${device}`],
            ['INCR', `portfolio:stats:browser:${browser}`],
            ['INCR', `portfolio:stats:os:${os}`],
            ['INCR', `portfolio:stats:ref:${ref}`],
            ['INCR', `portfolio:stats:day:${day}`],
          );
        }
        await redisPipeline(writes);

        res.writeHead(200, headers);
        res.end(JSON.stringify({ count }));
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        strategies: 'injectManifest',
        srcDir: 'src',
        filename: 'sw.js',
        registerType: 'prompt',
        injectManifest: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff,woff2}'],
          globIgnores: ['**/offline.html'],
        },
        manifest: {
          name: 'Sarwar Hossain · Backend Engineer',
          short_name: 'Sarwar',
          description: 'Backend Engineer portfolio — Node.js, TypeScript, NestJS, microservices.',
          theme_color: '#f59e0b',
          background_color: '#09090b',
          display: 'standalone',
          scope: '/',
          start_url: '/?source=pwa',
          orientation: 'portrait-primary',
          categories: ['portfolio'],
          icons: [
            { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
            { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
            { src: '/icons/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          ],
        },
        devOptions: {
          enabled: false,
          type: 'module',
        },
      }),
      localChatApi(env.GROQ_API_KEY),
      localVisitorsApi(env.UPSTASH_REDIS_REST_URL, env.UPSTASH_REDIS_REST_TOKEN),
    ],
  };
});
