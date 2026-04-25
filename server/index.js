import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import debutRouter from './routes/debut.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
// 先加载仓库根 .env，再加载 server/.env 并允许覆盖（本地端口等）。
// 若顺序反了且 server/.env 里留有空的 REPLICATE_API_TOKEN=，会挡住根目录里已填的 Token。
dotenv.config({ path: path.join(__dirname, '../.env') })
dotenv.config({ path: path.join(__dirname, '.env'), override: true })

const app = express()

app.set('trust proxy', 1)
app.use(cors())
app.use(express.json())
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

app.use('/api/debut', debutRouter)

const PORT = process.env.PORT || 3001

// 开发时若误在浏览器打开 API 端口（如 :3002），避免「白屏 + 404」，提示正确入口
if (process.env.NODE_ENV !== 'production') {
  app.get('/', (_req, res) => {
    res.type('html').send(`<!DOCTYPE html>
<html lang="zh-CN"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>API 服务</title></head><body style="font-family:system-ui;padding:1.5rem;max-width:32rem;line-height:1.6">
<p><strong>这是后端接口服务</strong>（当前端口 <code>${PORT}</code>），不提供前端页面。</p>
<p>请在终端里看 Vite 打印的地址，一般为本机：</p>
<p><a href="http://localhost:5173">http://localhost:5173</a>（若 5173 被占用则可能是 5174、5175…）</p>
<p style="color:#666;font-size:.9rem">控制台里关于 <code>.well-known/appspecific/com.chrome.devtools.json</code> 的 CSP 提示来自 Chrome 开发者工具，可忽略。</p>
</body></html>`)
  })
}

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`))
