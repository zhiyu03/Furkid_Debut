/**
 * Use a vision LLM to score the transformed pet image.
 *
 * Expected env vars:
 *   VISION_API_URL  - vision model endpoint
 *   VISION_API_KEY  - API key
 *
 * Returns: { score: number, comment: string }
 */
export async function scoreImage(imageUrl, style) {
  const apiUrl = process.env.VISION_API_URL
  const apiKey = process.env.VISION_API_KEY

  if (!apiUrl || !apiKey) {
    // Dev fallback: return a random score
    const score = Math.floor(Math.random() * 30) + 70
    return {
      score,
      comment: getRandomComment(score, style?.name),
    }
  }

  // --- Replace this block with your real vision API integration ---
  // Example structure (adapt to your provider):
  //
  // const response = await fetch(apiUrl, {
  //   method: 'POST',
  //   headers: {
  //     'Authorization': `Bearer ${apiKey}`,
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify({
  //     model: 'your-vision-model',
  //     messages: [{
  //       role: 'user',
  //       content: [
  //         { type: 'text', text: buildScorePrompt(style) },
  //         { type: 'image_url', image_url: { url: imageUrl } },
  //       ],
  //     }],
  //   }),
  // })
  //
  // const data = await response.json()
  // return parseScoreFromResponse(data)

  throw new Error('VISION_API_URL / VISION_API_KEY set but integration not implemented')
}

function getRandomComment(score, styleName) {
  const comments = [
    `${styleName || '这身'}造型太适合这只小可爱了！简直是天生丽质！`,
    `哇！这个造型让它的颜值直接翻倍，时尚指数拉满！`,
    `这身搭配绝了！走在街上回头率百分百！`,
    `不愧是宠物界的时尚Icon，这气质拿捏得死死的！`,
  ]
  return comments[Math.floor(Math.random() * comments.length)]
}

function buildScorePrompt(style) {
  return `You are a fun pet fashion judge. Score this pet's "${style?.name || 'stylish'}" look from 0-100 and give a playful one-sentence comment in Chinese. Reply in JSON: { "score": number, "comment": string }`
}
