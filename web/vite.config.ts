import path from "path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const STORAGE_BASE = process.env.STORAGE_BASE || env.STORAGE_BASE;

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      proxy: {
        '/media': {
          target: STORAGE_BASE,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace('/media', '')
        }
      }
    }
  }
});
