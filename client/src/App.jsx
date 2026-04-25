import { useMemo, useState } from 'react'
import catalog from '@catalog/itemCatalog.json'
import { downscaleImageFile } from './utils/downscaleImage'
import MobileShell from './components/mobile/MobileShell'
import SelectedSidebar from './components/mobile/SelectedSidebar'
import MainImagePanel from './components/mobile/MainImagePanel'
import CategoryTabs from './components/mobile/CategoryTabs'
import ItemGrid from './components/mobile/ItemGrid'
import ResultView from './components/mobile/ResultView'

const STEPS = { DRESS: 'dress', GENERATING: 'generating', RESULT: 'result' }

const DEFAULT_CATEGORY = catalog.categories[0]?.id ?? 'headwear'

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
  const [activeCategory, setActiveCategory] = useState(DEFAULT_CATEGORY)
  const [resultImage, setResultImage] = useState(null)
  const [error, setError] = useState(null)
  const [info, setInfo] = useState(null)

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
      setError(err.message || '出道定妆失败，请重试')
      setStep(STEPS.DRESS)
    }
  }

  const handleReset = () => {
    setStep(STEPS.DRESS)
    setImageFile(null)
    setImagePreview(null)
    setSelections([])
    setActiveCategory(DEFAULT_CATEGORY)
    setResultImage(null)
    setError(null)
    setInfo(null)
  }

  const activeCategoryLabel = categories.find((c) => c.id === activeCategory)?.name ?? ''
  const gridItems = catalog.items[activeCategory] || []

  return (
    <MobileShell>
      <header className="shrink-0 py-1 text-center">
        <h1 className="text-lg font-extrabold tracking-tight text-brand drop-shadow-sm">毛孩子出道计划</h1>
      </header>

      {error && (
        <div className="mb-1 shrink-0 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">
          {error}
        </div>
      )}
      {info && step === STEPS.RESULT && (
        <div className="mb-1 shrink-0 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[10px] text-amber-900">
          {info}
        </div>
      )}

      {step === STEPS.DRESS && (
        <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-hidden">
          <div className="flex min-h-[38vh] flex-1 basis-0 gap-2 overflow-hidden rounded-xl bg-zinc-200/90 p-2">
            <SelectedSidebar
              selections={selections}
              onRemove={(index) => setSelections((s) => s.filter((_, i) => i !== index))}
            />
            <MainImagePanel previewUrl={imagePreview} onImageSelected={handleImageSelected} />
          </div>

          <CategoryTabs
            categories={catalog.categories}
            activeId={activeCategory}
            onChange={setActiveCategory}
          />

          <ItemGrid
            categoryLabel={activeCategoryLabel}
            items={gridItems}
            isSelected={(itemId) =>
              selections.some((s) => s.categoryId === activeCategory && s.itemId === itemId)
            }
            onToggle={(itemId) => toggleSelection(activeCategory, itemId)}
          />

          <button
            type="button"
            disabled={!imageFile}
            onClick={handleDebut}
            className="mt-1 shrink-0 rounded-full bg-brand py-3 text-center text-sm font-bold text-white shadow-lg transition enabled:active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
          >
            生成出道定妆
          </button>
        </div>
      )}

      {step === STEPS.GENERATING && (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 py-16">
          <div className="h-14 w-14 animate-spin rounded-full border-4 border-brand border-t-transparent" />
          <p className="text-center text-sm text-gray-600">正在为你的毛孩子打光、定妆…</p>
          <p className="max-w-[18rem] text-center text-xs leading-relaxed text-gray-400">
            云端排队中，定妆出图可能要几十秒到几分钟。上传前已自动压缩大图。
          </p>
        </div>
      )}

      {step === STEPS.RESULT && imagePreview && resultImage && (
        <div className="flex min-h-0 flex-1 flex-col">
          <ResultView original={imagePreview} result={resultImage} onReset={handleReset} />
        </div>
      )}
    </MobileShell>
  )
}
