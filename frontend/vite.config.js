import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // ログレベルを設定（'error' | 'warn' | 'info' | 'silent'）
  logLevel: 'info',
  server: {
    host: '0.0.0.0',
    port: 3000,
    watch: {
      usePolling: true,
      interval: 250,
      binaryInterval: 500,
      ignored: ['**/node_modules/**', '**/.git/**', '**/dist/**'],
      followSymlinks: false,
    },
    hmr: {
      port: 3000,
      host: 'localhost',
      overlay: true,
    },
    fs: {
      strict: false,
    },
    proxy: {
      '/api': {
        // 開発時：直接Dockerのバックエンドに接続
        target: 'http://backend:5001',
        changeOrigin: true
      }
    }
  },
  optimizeDeps: {
    force: true
  }
})
