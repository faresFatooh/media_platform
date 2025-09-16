import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const port = parseInt(process.env.PORT) || 5173;
  
  return {
    plugins: [react()],
    
    // إضافة هذا السطر لتحديد مسار index.html
    root: path.resolve(__dirname),
    
    server: {
      host: '0.0.0.0',
      port: port,
      strictPort: true,
      allowedHosts: [
        'infographic-service.onrender.com',
        '.onrender.com',
        'localhost'
      ]
    },

    preview: {
      host: '0.0.0.0',
      port: port,
      strictPort: true,
      allowedHosts: [
        'infographic-service.onrender.com',
        '.onrender.com',
        'localhost'
      ]
    },

    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    },
    
    build: {
      outDir: 'dist',
      sourcemap: false,
      // إضافة هذا لتحديد نقطة الدخول بشكل صريح
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html')
        }
      }
    }
  };
});