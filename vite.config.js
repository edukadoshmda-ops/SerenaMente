import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

function apiDevPlugin() {
  return {
    name: 'api-dev-middleware',
    configureServer(server) {
      server.middlewares.stack.unshift({
        route: '',
        handle: async (req, res, next) => {
          if (!req.url.startsWith('/api/')) return next();

          try {
            let body = {};
            if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
              const buffers = [];
              for await (const chunk of req) {
                buffers.push(chunk);
              }
              const rawBody = Buffer.concat(buffers).toString();
              if (rawBody) {
                try {
                  body = JSON.parse(rawBody);
                } catch (e) {
                  body = {};
                }
              }
            }

            req.body = body;

            // Shim res.status e res.json
            res.status = (code) => {
              res.statusCode = code;
              return res;
            };
            res.json = (data) => {
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(data));
              return res;
            };

            const pathname = req.url.split('?')[0];

            if (pathname === '/api/admin-subscriptions') {
              const { default: handler } = await server.ssrLoadModule('./api/admin-subscriptions.js');
              return await handler(req, res);
            } else if (pathname === '/api/create-pix') {
              const { default: handler } = await server.ssrLoadModule('./api/create-pix.js');
              return await handler(req, res);
            }

            next();
          } catch (err) {
            console.error('Erro na rota API dev:', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message }));
          }
        }
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), apiDevPlugin()],
  build: {
    emptyOutDir: false
  },
  server: {
    port: 3000,
    strictPort: false, // Se a 3000 estiver ocupada, usa automaticamente a próxima porta livre
    open: true,        // Abre automaticamente o navegador ao iniciar
    host: true,
    watch: {
      ignored: ['**/dist/**', '**/.git/**']
    }
  }
});
