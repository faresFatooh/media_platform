import path from "path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],
    define: {
      // 👇 مهم علشان نستعمل import.meta.env بدل process.env
      "import.meta.env.VITE_GEMINI_API_KEY": JSON.stringify(env.VITE_GEMINI_API_KEY),
      "import.meta.env.VITE_WS_BACKEND_URL": JSON.stringify(env.VITE_WS_BACKEND_URL),
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "."),
      },
    },
    server: {
      host: true,
      watch: {
        usePolling: true,
      },
      allowedHosts: [".onrender.com"],

      proxy: {
        "/api": {
          // 👇 لو شغال محلي، هيوصل للباك إند على localhost
          // لو على Render، رح يستعمل VITE_BACKEND_URL من env
          target: env.VITE_BACKEND_URL || "http://localhost:3001",
          changeOrigin: true,
          secure: false,
          rewrite: (p) => p.replace(/^\/api/, ""),
        },
      },
    },
  };
});
