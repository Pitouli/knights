import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  // Keep local dev at root, but serve built assets from the GitHub Pages repo path.
  base: command === 'build' ? '/knights/' : '/',
}))
