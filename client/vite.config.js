import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** 与根目录 / server 下 .env 的 PORT 对齐，避免后端改端口后代理仍指向 3001 */
function readBackendPort() {
  if (process.env.PORT) return String(process.env.PORT)
  for (const rel of ['../.env', '../server/.env']) {
    try {
      const txt = fs.readFileSync(path.resolve(__dirname, rel), 'utf8')
      for (const line of txt.split('\n')) {
        const m = line.match(/^\s*PORT\s*=\s*"?(\d+)"?\s*(?:#.*)?$/)
        if (m) return m[1]
      }
    } catch {
      /* missing file */
    }
  }
  return '3001'
}

const backendOrigin = `http://127.0.0.1:${readBackendPort()}`

export default defineConfig({
  // 相对路径，便于根目录 index.html 与静态托管（含子路径）加载资源
  base: './',
  plugins: [react()],
  resolve: {
    alias: {
      '@catalog': path.resolve(__dirname, '../catalog'),
    },
  },
  server: {
    port: 5173,
    strictPort: false,
    fs: { allow: [path.resolve(__dirname, '..')] },
    proxy: {
      '/api': { target: backendOrigin, changeOrigin: true },
      '/uploads': { target: backendOrigin, changeOrigin: true },
    },
  },
})
