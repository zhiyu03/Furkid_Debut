import Replicate from 'replicate'

/**
 * @param {{ imageUrl: string, prompt: string, aspectRatio?: string }} opts
 * @returns {Promise<Buffer>} image bytes
 * aspect_ratio 仅允许：1:1、3:2、2:3（Replicate openai/gpt-image-2 校验）
 */
const ALLOWED_ASPECT = new Set(['1:1', '3:2', '2:3'])

export async function runGptImage2({ imageUrl, prompt, aspectRatio = '2:3' }) {
  const token = (process.env.REPLICATE_API_TOKEN || '').trim()
  if (!token) {
    throw new Error('REPLICATE_API_TOKEN is not set')
  }

  const ratio = ALLOWED_ASPECT.has(aspectRatio) ? aspectRatio : '2:3'
  const replicate = new Replicate({ auth: token })
  const input = {
    prompt,
    aspect_ratio: ratio,
    input_images: [imageUrl],
  }

  const output = await replicate.run('openai/gpt-image-2', { input })
  const first = Array.isArray(output) ? output[0] : output

  let urlString
  if (first && typeof first.url === 'function') {
    urlString = String(first.url())
  } else if (typeof first === 'string') {
    urlString = first
  } else {
    throw new Error('Unexpected Replicate output; check openai/gpt-image-2 schema')
  }

  const res = await fetch(urlString)
  if (!res.ok) {
    throw new Error(`Failed to download model output: ${res.status}`)
  }
  return Buffer.from(await res.arrayBuffer())
}
