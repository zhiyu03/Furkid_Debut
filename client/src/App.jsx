import { useState } from 'react'
import ImageUpload from './components/ImageUpload'
import StyleSelector from './components/StyleSelector'
import ResultDisplay from './components/ResultDisplay'
import ScoreModal from './components/ScoreModal'

const STEPS = { UPLOAD: 0, STYLE: 1, GENERATING: 2, RESULT: 3 }

export default function App() {
  const [step, setStep] = useState(STEPS.UPLOAD)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [selectedStyle, setSelectedStyle] = useState(null)
  const [resultImage, setResultImage] = useState(null)
  const [scoreData, setScoreData] = useState(null)
  const [showScore, setShowScore] = useState(false)

  const handleImageSelected = (file, preview) => {
    setImageFile(file)
    setImagePreview(preview)
    setStep(STEPS.STYLE)
  }

  const handleGenerate = async () => {
    setStep(STEPS.GENERATING)

    const formData = new FormData()
    formData.append('image', imageFile)
    formData.append('style', JSON.stringify(selectedStyle))

    try {
      const res = await fetch('/api/generate', { method: 'POST', body: formData })
      if (!res.ok) throw new Error('Generation failed')
      const data = await res.json()

      setResultImage(data.resultImage)
      setScoreData(data.score)
      setStep(STEPS.RESULT)
    } catch (err) {
      alert('生成失败，请重试: ' + err.message)
      setStep(STEPS.STYLE)
    }
  }

  const handleReset = () => {
    setStep(STEPS.UPLOAD)
    setImageFile(null)
    setImagePreview(null)
    setSelectedStyle(null)
    setResultImage(null)
    setScoreData(null)
    setShowScore(false)
  }

  return (
    <div className="min-h-screen flex flex-col items-center py-8 px-4">
      <h1 className="text-4xl font-extrabold text-brand mb-2 drop-shadow-sm">
        毛孩子出道计划
      </h1>
      <p className="text-gray-500 mb-8">让你的毛孩子在抖音 C 位出道 ✨</p>

      {step === STEPS.UPLOAD && (
        <ImageUpload onSelected={handleImageSelected} />
      )}

      {step === STEPS.STYLE && (
        <div className="w-full max-w-lg flex flex-col items-center gap-6">
          <img
            src={imagePreview}
            alt="preview"
            className="w-64 h-64 object-cover rounded-2xl shadow-lg"
          />
          <StyleSelector
            selected={selectedStyle}
            onChange={setSelectedStyle}
          />
          <button
            disabled={!selectedStyle}
            onClick={handleGenerate}
            className="px-8 py-3 bg-brand text-white rounded-full font-bold text-lg
                       disabled:opacity-40 disabled:cursor-not-allowed
                       hover:scale-105 active:scale-95 transition-transform"
          >
            开始变身!
          </button>
        </div>
      )}

      {step === STEPS.GENERATING && (
        <div className="flex flex-col items-center gap-4 mt-12">
          <div className="w-16 h-16 border-4 border-brand border-t-transparent rounded-full animate-spin" />
          <p className="text-lg text-gray-600">AI 正在施展魔法中...</p>
        </div>
      )}

      {step === STEPS.RESULT && (
        <ResultDisplay
          original={imagePreview}
          result={resultImage}
          onScore={() => setShowScore(true)}
          onReset={handleReset}
        />
      )}

      {showScore && scoreData && (
        <ScoreModal score={scoreData} onClose={() => setShowScore(false)} />
      )}
    </div>
  )
}
