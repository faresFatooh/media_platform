import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.N8N_API_KEY || ''), // أضف N8N_API_KEY
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || ''), // حافظ على GEMINI_API_KEY
      'process.env.N8N_API_KEY': JSON.stringify(env.N8N_API_KEY || ''), // أضف N8N_API_KEY كمتغير مستقل
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'), // عدّلت المسار عشان يكون أكثر دقة (افتراضي إن المصدر في src)
      },
    },
  };
});