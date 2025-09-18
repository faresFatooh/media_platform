import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
        '@': path.resolve(__dirname, '.'),
    }
  },
  server: {
    host: true, // ضروري للاستماع من خارج الحاوية
    watch: {
      usePolling: true // مهم لبيئة Docker
    },
    // --- هذا هو السطر المهم الذي يحل المشكلة ---
    // يسمح بالاتصال من أي رابط ينتهي بـ .onrender.com
    allowedHosts: ['.onrender.com']
  }
})