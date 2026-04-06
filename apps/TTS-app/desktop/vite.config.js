import { defineConfig } from 'vite';

export default defineConfig({
    base: './', // Ensures relative paths for Electron
    build: {
        outDir: 'dist',
        assetsDir: 'assets',
    },
    server: {
        port: 5173,
    }
});
