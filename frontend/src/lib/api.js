// Backend base URL.
//   - Local dev (`npm run dev`): talk to the Flask server on 127.0.0.1:5000.
//   - Production build: talk to the deployed Render backend.
//   - Either can be overridden with VITE_API_BASE_URL (e.g. in a .env file).
const DEV_API_BASE_URL = 'http://127.0.0.1:5000'


const fallbackBaseUrl = import.meta.env.DEV ? DEV_API_BASE_URL : PROD_API_BASE_URL

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || fallbackBaseUrl).replace(/\/$/, '')

export function apiUrl(path) {
  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`
}