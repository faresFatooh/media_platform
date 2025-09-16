import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');

  return {
    plugins: [react() as any],   // حل مشكلة TypeScript مع plugin
    server: {
      host: true,
      port: 5173,
      watch: {
        usePolling: true
      },
      cors: true,
      strictPort: false,
      allowedHosts: true       // ✅ السماح لأي host خارجي
    },
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.')
      }
    }
  };
});
