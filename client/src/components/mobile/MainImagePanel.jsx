import { useEffect, useRef, useState } from 'react'

export default function MainImagePanel({ previewUrl, onImageSelected, petName, onPetNameChange }) {
  const inputRef = useRef(null)
  const [nameModalOpen, setNameModalOpen] = useState(false)
  const [nameInput, setNameInput] = useState(petName || '')

  useEffect(() => {
    setNameInput(petName || '')
  }, [petName])

  const processFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = (e) => onImageSelected(file, e.target.result)
    reader.readAsDataURL(file)
  }

  const openPickerWithNameCheck = () => {
    if (petName?.trim()) {
      inputRef.current?.click()
      return
    }
    setNameModalOpen(true)
  }

  const confirmPetName = () => {
    const cleaned = nameInput.trim()
    if (!cleaned) return
    onPetNameChange?.(cleaned)
    setNameModalOpen(false)
    window.setTimeout(() => inputRef.current?.click(), 0)
  }

  return (
    <section className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-xl bg-white ring-1 ring-gray-200/80">
      <div
        className="relative flex min-h-[12rem] flex-1 cursor-pointer flex-col overflow-hidden rounded-xl bg-zinc-50"
        onClick={() => !previewUrl && openPickerWithNameCheck()}
      >
        {previewUrl ? (
          <img src={previewUrl} alt="宠物" className="h-full w-full min-h-[12rem] object-cover" />
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 p-4 text-center text-gray-600">
            <span className="text-4xl">🐾</span>
            <span className="text-sm font-semibold">点击上传宠物照片</span>
            {petName && <span className="text-[11px] text-gray-400">已命名：{petName}</span>}
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

      {nameModalOpen && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/35 p-3">
          <div className="w-full max-w-[18rem] rounded-2xl bg-white p-4 shadow-xl ring-1 ring-black/5">
            <p className="text-sm font-bold text-zinc-900">给毛孩子取个艺名吧</p>
            <p className="mt-1 text-[11px] leading-relaxed text-zinc-500">输入名字后，再为 Ta 选择照片。</p>
            <input
              autoFocus
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="例如：奶糖 / 旺财 / Mochi"
              maxLength={16}
              className="mt-3 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none ring-0 placeholder:text-zinc-400 focus:border-rose-300"
              onKeyDown={(e) => {
                if (e.key === 'Enter') confirmPetName()
              }}
            />
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => setNameModalOpen(false)}
                className="flex-1 rounded-full border border-zinc-200 bg-white py-2 text-xs font-semibold text-zinc-700 active:scale-[0.98]"
              >
                取消
              </button>
              <button
                type="button"
                onClick={confirmPetName}
                disabled={!nameInput.trim()}
                className="flex-1 rounded-full bg-brand py-2 text-xs font-bold text-white active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
              >
                下一步选照片
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
