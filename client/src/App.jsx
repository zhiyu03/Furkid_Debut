import { useMemo, useState } from 'react'
import catalog from '@catalog/itemCatalog.json'
import { downscaleImageFile } from './utils/downscaleImage'
import MobileShell from './components/mobile/MobileShell'
import PetColumn from './components/mobile/PetColumn'
import CategoryRail from './components/mobile/CategoryRail'
import CategoryPanel from './components/mobile/CategoryPanel'
import ResultView from './components/mobile/ResultView'

const STEPS = { DRESS: 'dress', GENERATING: 'generating', RESULT: 'result' }

function buildCategoryList() {
  return catalog.categories.map((c) => ({
    ...c,
    items: catalog.items[c.id] || [],
  }))
}

export default function App() {
  const categories = useMemo(() => buildCategoryList(), [])
  const [step, setStep] = useState(STEPS.DRESS)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [selections, setSelections] = useState([])
  const [activeCategory, setActiveCategory] = useState(null)
  const [resultImage, setResultImage] = useState(null)
  const [error, setError] = useState(null)
  const [info, setInfo] = useState(null)

  const activePanel = useMemo(
    () => categories.find((c) => c.id === activeCategory) || null,
    [activeCategory, categories],
  )

  const handleImageSelected = (file, preview) => {
    setImageFile(file)
    setImagePreview(preview)
    setError(null)
  }

  const toggleSelection = (categoryId, itemId) => {
    setSelections((prev) => {
      const idx = prev.findIndex((s) => s.categoryId === categoryId && s.itemId === itemId)
      if (idx >= 0) {
        return prev.filter((_, i) => i !== idx)
      }
      const max = catalog.maxPerCategory[categoryId] ?? 99
      const inCat = prev.filter((s) => s.categoryId === categoryId)
      if (inCat.length >= max) {
        const firstIdx = prev.findIndex((s) => s.categoryId === categoryId)
        const next = [...prev]
        next.splice(firstIdx, 1)
        next.push({ categoryId, itemId })
        return next
      }
      return [...prev, { categoryId, itemId }]
    })
    setActiveCategory(null)
  }

  const handleDebut = async () => {
    if (!imageFile) {
      setError('请先上传宠物照片')
      return
    }
    setError(null)
    setInfo(null)
    setStep(STEPS.GENERATING)

    const formData = new FormData()
    const uploadFile = await downscaleImageFile(imageFile, 1280, 0.88)
    formData.append('image', uploadFile)
    formData.append('selections', JSON.stringify(selections))

    try {
      const res = await fetch('/api/debut', { method: 'POST', body: formData })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.error || `请求失败 (${res.status})`)
      }
      setResultImage(data.resultImage)
      if (data.mock && data.message) setInfo(data.message)
      setStep(STEPS.RESULT)
    } catch (err) {
      setError(err.message || '变装失败')
      setStep(STEPS.DRESS)
    }
  }

  const handleReset = () => {
    setStep(STEPS.DRESS)
    setImageFile(null)
    setImagePreview(null)
    setSelections([])
    setActiveCategory(null)
    setResultImage(null)
    setError(null)
    setInfo(null)
  }

  return (
    <MobileShell>
      <header className="mb-3 text-center">
        <h1 className="text-xl font-extrabold tracking-tight text-brand drop-shadow-sm">毛孩子出道计划</h1>
        <p className="text-xs text-gray-500">造型 · 妆容 · 饰品一键合成</p>
      </header>

      {error && (
        <div className="mb-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</div>
      )}
      {info && step === STEPS.RESULT && (
        <div className="mb-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">{info}</div>
      )}

      {step === STEPS.DRESS && (
        <>
          <div className="flex min-h-[52vh] flex-1 flex-row gap-2">
            <PetColumn
              previewUrl={imagePreview}
              selections={selections}
              onRemoveSelection={(index) =>
                setSelections((s) => s.filter((_, i) => i !== index))
              }
              onImageSelected={handleImageSelected}
            />
            <CategoryRail categories={catalog.categories} onOpen={setActiveCategory} />
          </div>

          {activePanel && (
            <CategoryPanel
              category={activePanel}
              onPick={toggleSelection}
              onClose={() => setActiveCategory(null)}
            />
          )}

          <button
            type="button"
            disabled={!imageFile}
            onClick={handleDebut}
            className="mt-auto w-full rounded-full bg-brand py-3.5 text-center text-base font-bold text-white shadow-lg transition enabled:active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
          >
            开始变装
          </button>
        </>
      )}

      {step === STEPS.GENERATING && (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 py-24">
          <div className="h-14 w-14 animate-spin rounded-full border-4 border-brand border-t-transparent" />
          <p className="text-center text-sm text-gray-600">AI 正在合成中，请稍候…</p>
          <p className="max-w-[18rem] text-center text-xs leading-relaxed text-gray-400">
            云端排队 + 出图常需数十秒至数分钟，与模型负载有关。上传前已自动压缩大图以略减耗时。
          </p>
        </div>
      )}

      {step === STEPS.RESULT && imagePreview && resultImage && (
        <ResultView original={imagePreview} result={resultImage} onReset={handleReset} />
      )}
    </MobileShell>
  )
}
