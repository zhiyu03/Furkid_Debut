/**
 * 缩小过长边，减轻上传与云端处理量（对排队后的 GPU 时间也有轻微帮助）。
 * @param {File} file
 * @param {number} maxEdge 最长边像素上限
 * @param {number} quality JPEG 0..1
 * @returns {Promise<File>}
 */
export async function downscaleImageFile(file, maxEdge = 1280, quality = 0.88) {
  if (!file?.type?.startsWith('image/')) return file
  try {
    const img = await createImageBitmap(file)
    const w = img.width
    const h = img.height
    const max = Math.max(w, h)
    if (max <= maxEdge) {
      img.close?.()
      return file
    }
    const scale = maxEdge / max
    const tw = Math.round(w * scale)
    const th = Math.round(h * scale)
    const canvas = document.createElement('canvas')
    canvas.width = tw
    canvas.height = th
    const ctx = canvas.getContext('2d')
    if (!ctx) return file
    ctx.drawImage(img, 0, 0, tw, th)
    img.close?.()
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality))
    if (!blob) return file
    const base = file.name.replace(/\.[^.]+$/, '') || 'pet'
    return new File([blob], `${base}.jpg`, { type: 'image/jpeg' })
  } catch {
    return file
  }
}
