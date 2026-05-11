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
    ],
  };
});
