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
      include: [/node_modules/],
    },
    rollupOptions: {
      external: (id) => {
        // Externalizar todos los módulos internos de Firebase
        if (id.startsWith("@firebase/")) return true;
        return false;
      },
    },
  },
  optimizeDeps: {
    exclude: ["@firebase/util", "@firebase/webchannel-wrapper"],
    include: [
      "firebase",
      "firebase/app",
      "firebase/firestore",
      "firebase/auth",
      "firebase/storage",
      "firebase/analytics",
      "firebase/functions",
    ],
    esbuildOptions: {
      target: "es2020",
    },
  },
});
