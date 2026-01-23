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

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), removeCrossorigin()],
  base: '/',
  server: {
    host: true,
    port: 3000
  },
  build: {
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        format: 'es',
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]'
      }
    },
    // Увеличиваем размер предупреждений для больших чанков
    chunkSizeWarningLimit: 1000
  }
})





