export default function ScoreModal({ score, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-extrabold text-brand mb-4">AI 时尚评分</h2>

        <div className="text-6xl font-black text-brand mb-2">{score.score}</div>
        <div className="text-sm text-gray-400 mb-4">/ 100 分</div>

        <p className="text-gray-700 leading-relaxed mb-6">{score.comment}</p>

        <button
          onClick={onClose}
          className="px-8 py-2 bg-brand text-white rounded-full font-bold hover:scale-105 active:scale-95 transition-transform"
        >
          好的！
        </button>
      </div>
    </div>
  )
}
