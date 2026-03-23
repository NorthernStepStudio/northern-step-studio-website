import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";


export default defineConfig({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  plugins: [
    react(),
  ],
  server: {
    allowedHosts: true,
  },
  build: {
    chunkSizeWarningLimit: 5000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@nexusbuild": path.resolve(__dirname, "../nexusbuild/apps/web/src"),
      "@shared": path.resolve(__dirname, "../nexusbuild/packages/shared/src"),
    },
  },
});
