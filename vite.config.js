import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    react(),
    {
      name: "firebase-resolver",
      resolveId(id) {
        if (id.startsWith("@firebase/webchannel-wrapper")) {
          return { id, external: true };
        }
        if (id === "@firebase/functions") {
          return { id: "firebase/functions", external: false };
        }
        return null;
      },
    },
  ],
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
      external: [
        "@firebase/webchannel-wrapper",
        /@firebase\/webchannel-wrapper\/.*/,
      ],
      onwarn(warning, warn) {
        if (warning.message?.includes("webchannel-wrapper")) return;
        warn(warning);
      },
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
      "@firebase/functions",
    ],
    exclude: ["@firebase/webchannel-wrapper"],
    esbuildOptions: {
      target: "es2020",
    },
  },
  resolve: {
    alias: {},
  },
});
