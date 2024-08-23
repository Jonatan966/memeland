import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      '/media': {
        target: process.env.STORAGE_BASE,
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace('/media', '')
      }
    }
  }
});
