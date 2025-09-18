import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
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