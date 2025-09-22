import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
        plugins: [react()],
        define: {
            'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
            'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
        },
        resolve: {
            alias: {
                '@': path.resolve(__dirname, '.'),
            }
        },
        server: {
            host: true, 
            watch: {
                usePolling: true
            },
            // يسمح للمتصفح بالوصول إلى هذه الخدمة من الإنترنت
            allowedHosts: ['.onrender.com'],
            
            // --- هذا هو القسم الجديد والمهم ---
            // يخبر الواجهة الأمامية بكيفية التحدث مع الخادم الخلفي
            proxy: {
                '/api': {
                    target: 'http://localhost:3001', // الخادم الخلفي يعمل على هذا المنفذ داخليًا
                    changeOrigin: true,
                    secure: false,
                    // يقوم بإعادة كتابة المسار قبل إرساله
                    // مثال: /api/predict  ->  /predict
                    rewrite: (path) => path.replace(/^\/api/, ''), 
                }
            }
        }
    };
});