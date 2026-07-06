import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// The frontend talks to the backend via absolute URLs (see src/lib/api.js),
// with CORS enabled on the Flask side, so no dev proxy is needed.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    open: true,
  },
})