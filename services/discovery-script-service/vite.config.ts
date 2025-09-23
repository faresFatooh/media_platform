import path from "path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],
    define: {
      "import.meta.env.VITE_GEMINI_API_KEY": JSON.stringify(env.VITE_GEMINI_API_KEY),
      "import.meta.env.VITE_WS_BACKEND_URL": JSON.stringify(env.VITE_WS_BACKEND_URL),
      "import.meta.env.VITE_MAIN_BACKEND_URL": JSON.stringify(env.MAIN_BACKEND_URL), // 👈 صار MAIN_BACKEND_URL
    },
    resolve: {
      alias: { "@": path.resolve(__dirname, ".") },
    },
    server: {
      host: true,
      watch: { usePolling: true },
      allowedHosts: [".onrender.com"],
      proxy: {
        "/api": {
          target: env.MAIN_BACKEND_URL || "http://127.0.0.1:8000",
          changeOrigin: true,
          secure: false,
          rewrite: (p) => p.replace(/^\/api/, ""),
        },
      },
    },
  };
});
