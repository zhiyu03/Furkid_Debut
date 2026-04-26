import { useRef } from 'react'

export default function MainImagePanel({ previewUrl, onImageSelected }) {
  const inputRef = useRef(null)

  const processFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = (e) => onImageSelected(file, e.target.result)
    reader.readAsDataURL(file)
  }

  return (
    <section className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-xl bg-white ring-1 ring-gray-200/80">
      <div
        className="relative flex min-h-[12rem] flex-1 cursor-pointer flex-col overflow-hidden rounded-xl bg-zinc-50"
        onClick={() => !previewUrl && inputRef.current?.click()}
      >
        {previewUrl ? (
          <img src={previewUrl} alt="宠物" className="h-full w-full min-h-[12rem] object-cover" />
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 p-4 text-center text-gray-600">
            <span className="text-4xl">🐾</span>
            <span className="text-sm font-semibold">点击上传宠物照片</span>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => processFile(e.target.files?.[0])}
        />
      </div>
      {previewUrl && (
        <button
          type="button"
          className="shrink-0 border-t border-gray-100 bg-white py-2 text-center text-[11px] font-medium text-gray-700 active:bg-gray-50"
          onClick={() => inputRef.current?.click()}
        >
          更换照片
        </button>
      )}
    </section>
  )
}
