import path from "path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  // ✅ نقرأ كل envs مع prefix VITE_
  const env = loadEnv(mode, process.cwd(), "VITE_");

  console.log("🔑 Loaded env vars from vite.config.ts:");
  console.log("Gemini:", env.VITE_GEMINI_API_KEY);
  console.log("Claude Proxy:", env.VITE_CLAUDE_PROXY_URL);
  console.log("Backend:", env.VITE_MAIN_BACKEND_URL);

  return {
    plugins: [react()],

    server: {
      host: true,
      watch: {
        usePolling: true,
      },
      allowedHosts: [".onrender.com"],
    },

    resolve: {
      alias: {
        "@": path.resolve(__dirname, "."),
      },
    },
  };
});
