import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            // Allows you to use '@/' as a shortcut to the root folder
            '@': path.resolve(__dirname, '.'),
        }
    },
    server: {
        host: true,
        watch: {
            usePolling: true
        },
        // This is important for Render deployment
        allowedHosts: ['.onrender.com'] 
    }
});