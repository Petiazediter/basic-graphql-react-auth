import { defineConfig, type ServerOptions } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'


const serverConfig: ServerOptions = {
  proxy: {
    '/api': {
      target: 'http://localhost:4000',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, ''),
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: serverConfig,
  preview: serverConfig,
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  }
})
