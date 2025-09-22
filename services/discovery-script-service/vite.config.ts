import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // هذا الإعداد ضروري ليعمل الخادم داخل حاوية Docker
    watch: {
      usePolling: true
    },
    hmr: {
      // هذا يخبر عميل Vite بكيفية الاتصال بشكل صحيح
      // عندما يعمل خلف وكيل Render الذي يستخدم HTTPS على منفذ 443
      clientPort: 443,
    }
  }
})