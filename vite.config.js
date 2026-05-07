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
      "@firebase/app",
      "@firebase/firestore",
      "@firebase/auth",
      "@firebase/storage",
      "@firebase/analytics",
      "@firebase/functions",
      "@firebase/util",
      "@firebase/logger",
      "@firebase/component",
      "@firebase/webchannel-wrapper",
    ],
  },
});
