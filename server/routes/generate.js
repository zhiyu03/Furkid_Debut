import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import { generateImage } from '../services/imageGen.js'
import { buildPrompt } from '../services/promptBuilder.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const upload = multer({
  dest: path.join(__dirname, '..', 'uploads'),
  limits: { fileSize: 10 * 1024 * 1024 },
})

const router = Router()

router.post('/', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image uploaded' })

    const style = JSON.parse(req.body.style)
    const inputPath = req.file.path

    const prompt = buildPrompt(style)
    const resultPath = await generateImage(inputPath, prompt)
    const resultUrl = `/uploads/${path.basename(resultPath)}`

    // Auto-score after generation
    const { scoreImage } = await import('../services/scorer.js')
    const score = await scoreImage(resultUrl, style)

    res.json({ resultImage: resultUrl, score })
  } catch (err) {
    console.error('Generate error:', err)
    res.status(500).json({ error: err.message })
  }
})

export default router
