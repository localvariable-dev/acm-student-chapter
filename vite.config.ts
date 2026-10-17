import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

declare const process: { env: Record<string, string | undefined> }

export default defineConfig({
  // Use '/' for a custom domain; set GITHUB_PAGES_BASE_PATH for a project subpath.
  base: process.env.GITHUB_PAGES_BASE_PATH || '/',
  plugins: [react()],
})
