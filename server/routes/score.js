import { Router } from 'express'
import { scoreImage } from '../services/scorer.js'

const router = Router()

router.post('/', async (req, res) => {
  try {
    const { imageUrl, style } = req.body
    const score = await scoreImage(imageUrl, style)
    res.json(score)
  } catch (err) {
    console.error('Score error:', err)
    res.status(500).json({ error: err.message })
  }
})

export default router
