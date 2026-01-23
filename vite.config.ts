import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Плагин для удаления crossorigin из script тегов
const removeCrossorigin = () => {
  return {
    name: 'remove-crossorigin',
    transformIndexHtml(html: string) {
      return html.replace(/\s+crossorigin/g, '')
    }
  }
}

export default defineConfig({
  plugins: [react(), removeCrossorigin()],
  base: '/',
  build: {
    outDir: 'dist'
  }
})
