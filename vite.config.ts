import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { summaryApi } from './server/summary'
import { linkedinApi } from './server/linkedin'
import { checkApi } from './server/check'

export default defineConfig(({ mode }) => {
  // Loaded server-side only (no VITE_ prefix), so the key is never bundled for the browser.
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), tailwindcss(), summaryApi(env.GEMINI_API_KEY), linkedinApi(env.GEMINI_API_KEY), checkApi(env.GEMINI_API_KEY)],
    server: { port: 5173 },
  }
})
