import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // .env dosyası depo kökünde tutulur. Tarayıcı koduna yalnızca VITE_ ile
  // başlayan değişkenler aktarılır; SECRET_KEY gibi değerler frontend'e sızmaz.
  envDir: '..',
  server: {
    port: 5173,
  },
});
