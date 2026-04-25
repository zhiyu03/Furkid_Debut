import { useRef } from 'react'
import SelectedStrip from './SelectedStrip'

export default function PetColumn({ previewUrl, selections, onRemoveSelection, onImageSelected }) {
  const inputRef = useRef(null)

  const processFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = (e) => onImageSelected(file, e.target.result)
    reader.readAsDataURL(file)
  }

  return (
    <div className="flex w-1/3 min-w-[108px] max-w-[140px] flex-shrink-0 flex-col">
      <div
        className="relative aspect-[3/4] w-full cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed border-gray-300 bg-white/70 shadow-inner"
        onClick={() => !previewUrl && inputRef.current?.click()}
      >
        {previewUrl ? (
          <img src={previewUrl} alt="宠物" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-1 p-2 text-center">
            <span className="text-2xl">🐾</span>
            <span className="text-[10px] font-medium text-gray-500">点击上传照片</span>
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
          className="mt-1 w-full rounded-lg border border-gray-200 bg-white py-1 text-[10px] text-gray-600"
          onClick={() => inputRef.current?.click()}
        >
          更换照片
        </button>
      )}
      <SelectedStrip selections={selections} onRemove={onRemoveSelection} />
    </div>
  )
}
