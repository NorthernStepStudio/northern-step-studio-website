import path from "path";
import fs from "fs";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";


export default defineConfig({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  envPrefix: ["VITE_", "SUPABASE_URL", "SUPABASE_ANON_KEY"],
  plugins: [
    react(),
    {
      name: "serve-subapp-index",
      configureServer(server) {
        server.middlewares.use((req, _res, next) => {
          const url = req.url ? req.url.split('?')[0] : '';
          if (!url.includes('.') && url.startsWith('/signatempu')) {
            req.url = '/signatempu/index.html';
          } else if (!url.includes('.') && url.startsWith('/')) {
            const rootPath = path.resolve(process.cwd(), 'public', url.substring(1), 'index.html');
            const wsPath = path.resolve(process.cwd(), 'apps/Northern Step Studio website/public', url.substring(1), 'index.html');
            if (fs.existsSync(rootPath) || fs.existsSync(wsPath)) {
              req.url = url.endsWith('/') ? url + 'index.html' : url + '/index.html';
            }
          }
          next();
        });
      }
    },
    {
      name: "html-raw",
      transform(code, id) {
        if (id.endsWith(".html") && !id.endsWith("index.html")) {
          return `export default ${JSON.stringify(code)};`;
        }
      },
    },
  ],
  server: {
    allowedHosts: true,
    proxy: {
      "/api": {
        target: "http://localhost:8787",
        changeOrigin: true,
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 5000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
