import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { randomUUID } from 'crypto'
import { fileURLToPath } from 'url'
import { buildDebutPrompt } from '../services/debutPrompt.js'
import { runGptImage2 } from '../services/replicateDebut.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const uploadsDir = path.join(__dirname, '..', 'uploads')
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true })

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || '') || '.jpg'
    const safe = ext.match(/^\.(jpe?g|png|webp)$/i) ? ext.toLowerCase() : '.jpg'
    cb(null, `${randomUUID()}${safe}`)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 12 * 1024 * 1024 },
})

const router = Router()

function resolvePublicBaseUrl(req) {
  const fromEnv = process.env.PUBLIC_BASE_URL?.replace(/\/$/, '')
  if (fromEnv) return fromEnv
  const host = req.get('host')
  if (!host) return null
  const proto = req.protocol
  if (proto === 'http' && host.includes('localhost')) return null
  return `${proto}://${host}`
}

/** Replicate 在公网拉原图：loopback / 常见内网 IP 从云端不可达 */
function publicBaseUrlError(baseUrl) {
  try {
    const u = new URL(baseUrl)
    const h = u.hostname.toLowerCase()
    if (h === 'localhost' || h === '127.0.0.1' || h === '::1') {
      return 'PUBLIC_BASE_URL 不能使用 localhost 或 127.0.0.1：Replicate 在云端请求该地址时只会连到「它们自己的本机」，不是你的电脑，因此会 Connection refused。请改为 ngrok / cloudflared 等公网 HTTPS 根地址。'
    }
    if (/^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(h)) {
      return 'PUBLIC_BASE_URL 使用了内网地址 10.x.x.x，公网（Replicate）无法访问。请使用可公网访问的 HTTPS 域名。'
    }
    if (/^192\.168\.\d{1,3}\.\d{1,3}$/.test(h)) {
      return 'PUBLIC_BASE_URL 使用了局域网 192.168.x.x，Replicate 无法访问。请使用 ngrok 或已部署服务器的 HTTPS 地址。'
    }
    const m = h.match(/^172\.(\d{1,3})\.\d{1,3}\.\d{1,3}$/)
    if (m) {
      const second = Number(m[1])
      if (second >= 16 && second <= 31) {
        return 'PUBLIC_BASE_URL 使用了内网 172.16–172.31 段，Replicate 无法访问。请使用公网 HTTPS 地址。'
      }
    }
  } catch {
    return 'PUBLIC_BASE_URL 不是合法 URL'
  }
  return null
}

router.post('/', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '请上传宠物图片' })
    }

    let selections = []
    try {
      selections = JSON.parse(req.body.selections || '[]')
    } catch {
      return res.status(400).json({ error: 'selections 格式无效' })
    }

    if (!Array.isArray(selections)) {
      return res.status(400).json({ error: 'selections 必须为数组' })
    }

    const prompt = buildDebutPrompt(selections)
    const filename = req.file.filename
    const baseUrl = resolvePublicBaseUrl(req)
    const token = (process.env.REPLICATE_API_TOKEN || '').trim()
    const hasToken = token.length > 0

    if (!hasToken) {
      const outName = `debut-mock-${randomUUID()}${path.extname(filename)}`
      const outPath = path.join(uploadsDir, outName)
      await fs.promises.copyFile(req.file.path, outPath)
      return res.json({
        resultImage: `/uploads/${outName}`,
        mock: true,
        message: '未配置 REPLICATE_API_TOKEN，已返回本地拷贝（联调 UI 用）',
      })
    }

    if (!baseUrl) {
      return res.status(400).json({
        error:
          'Replicate 需要能公网访问原图 URL。请在 .env 设置 PUBLIC_BASE_URL（如 https://你的域名 或 ngrok HTTPS 地址），勿使用 localhost。',
        code: 'PUBLIC_BASE_URL_REQUIRED',
      })
    }

    const badBase = publicBaseUrlError(baseUrl)
    if (badBase) {
      return res.status(400).json({ error: badBase, code: 'PUBLIC_BASE_URL_UNREACHABLE' })
    }

    const imageUrl = `${baseUrl}/uploads/${filename}`
    const aspectRatio = process.env.DEBUT_ASPECT_RATIO || '2:3'
    const buffer = await runGptImage2({ imageUrl, prompt, aspectRatio })
    const outName = `debut-${randomUUID()}.webp`
    const outPath = path.join(uploadsDir, outName)
    await fs.promises.writeFile(outPath, buffer)

    res.json({
      resultImage: `/uploads/${outName}`,
      mock: false,
    })
  } catch (err) {
    console.error('Debut error:', err)
    res.status(500).json({ error: err.message || '变装失败' })
  }
})

export default router
