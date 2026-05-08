import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/cardnet": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    rollupOptions: {
      external: ["@firebase/webchannel-wrapper"],
    },
  },
  optimizeDeps: {
    include: [
      "firebase",
      "firebase/app",
      "firebase/firestore",
      "firebase/auth",
      "firebase/storage",
      "firebase/analytics",
      "firebase/functions",
    ],
    exclude: ["@firebase/functions", "@firebase/webchannel-wrapper"],
    esbuildOptions: {
      target: "es2020",
    },
  },
  resolve: {
    alias: {
      "@firebase/functions": "firebase/functions",
    },
  },
});
