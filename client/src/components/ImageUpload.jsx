import { useRef, useState } from 'react'

export default function ImageUpload({ onSelected }) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)

  const processFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = (e) => onSelected(file, e.target.result)
    reader.readAsDataURL(file)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    processFile(e.dataTransfer.files[0])
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`
        w-80 h-80 rounded-2xl border-4 border-dashed cursor-pointer
        flex flex-col items-center justify-center gap-3 transition-colors
        ${dragging ? 'border-accent bg-accent/10' : 'border-gray-300 bg-white/60 hover:border-brand'}
      `}
    >
      <span className="text-5xl">🐾</span>
      <p className="text-gray-500 font-medium">点击上传或拖拽宠物照片</p>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => processFile(e.target.files[0])}
      />
    </div>
  )
}
