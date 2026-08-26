import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  // Must match the GitHub Pages project path. Every shared permalink is
  // https://maddest-lad.github.io/fieldgrid/#... — changing this 404s all of them.
  base: '/fieldgrid/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@core': fileURLToPath(new URL('./src/core', import.meta.url)),
      '@app': fileURLToPath(new URL('./src/app', import.meta.url)),
      '@projects': fileURLToPath(new URL('./src/projects', import.meta.url)),
    },
  },
})
