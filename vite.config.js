import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: './',
  plugins: [react()],
  resolve: {
    alias: {
      // Alias para Firebase para evitar problemas con módulos internos
      'firebase/app': 'firebase/compat/app',
      'firebase/auth': 'firebase/compat/auth',
      'firebase/firestore': 'firebase/compat/firestore',
      'firebase/storage': 'firebase/compat/storage',
      // Agrega más según lo que uses de Firebase
    },
  },
})
