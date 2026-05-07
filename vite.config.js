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
    commonjsOptions: { transformMixedEsModules: true },
  },
  optimizeDeps: {
    exclude: ["@firebase/functions"],
    include: [
      "firebase/app",
      "firebase/firestore",
      "firebase/auth",
      "firebase/storage",
      "firebase/analytics",
    ],
  },
  resolve: {
    alias: {
      "@firebase/functions": "firebase/functions",
    },
  },
});
