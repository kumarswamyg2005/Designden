import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { readFileSync } from "fs";

function getBackendPort() {
  try {
    return parseInt(readFileSync(".port", "utf8").trim(), 10) || 5174;
  } catch {
    return 5174;
  }
}

export default defineConfig(() => {
  const backendPort = getBackendPort();
  const backendUrl = `http://localhost:${backendPort}`;

  // Return index.html for browser page navigations so React Router handles them
  const spaBypass = (req) => {
    if (req.headers.accept?.includes("text/html")) {
      return "/index.html";
    }
  };

  return {
    plugins: [react()],
    server: {
      proxy: {
        "/api": { target: backendUrl, changeOrigin: true },
        "/customer": { target: backendUrl, changeOrigin: true, bypass: spaBypass },
        "/designer": { target: backendUrl, changeOrigin: true, bypass: spaBypass },
        "/admin": { target: backendUrl, changeOrigin: true, bypass: spaBypass },
        "/delivery": { target: backendUrl, changeOrigin: true, bypass: spaBypass },
        "/manager": { target: backendUrl, changeOrigin: true, bypass: spaBypass },
        "/images": { target: backendUrl, changeOrigin: true },
        "/models": { target: backendUrl, changeOrigin: true },
        "/uploads": { target: backendUrl, changeOrigin: true },
        "/openapi.json": { target: backendUrl, changeOrigin: true },
        "/api-docs": { target: backendUrl, changeOrigin: true },
      },
    },
    build: {
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: {
            "react-vendor": ["react", "react-dom", "react-router-dom"],
            "redux-vendor": ["@reduxjs/toolkit", "react-redux", "redux-persist"],
            "three-vendor": ["three", "@react-three/fiber", "@react-three/drei"],
          },
        },
      },
    },
  };
});
