import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // تحميل متغيرات البيئة من ملف .env المناسب للوضع الحالي
  const env = loadEnv(mode, process.cwd(), '');

  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react()],
    define: {
      // مفاتيح API الخاصة بالـ frontend
      'process.env.VITE_GEMINI_API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY),
      'process.env.VITE_PEXELS_API_KEY': JSON.stringify(env.VITE_PEXELS_API_KEY),
      'process.env.VITE_UNSPLASH_ACCESS_KEY': JSON.stringify(env.VITE_UNSPLASH_ACCESS_KEY),
      'process.env.VITE_CLAUDE_PROXY_URL': JSON.stringify(env.VITE_CLAUDE_PROXY_URL),
      'process.env.VITE_MAIN_BACKEND_URL': JSON.stringify(env.VITE_MAIN_BACKEND_URL)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
  };
});
