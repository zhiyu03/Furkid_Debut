export default function MobileShell({ children }) {
  return (
    <div
      className="mx-auto flex h-[100dvh] max-h-[100dvh] w-full max-w-[430px] flex-col overflow-hidden bg-white/40 px-3 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(0.75rem,env(safe-area-inset-top))] shadow-xl backdrop-blur-sm"
    >
      {children}
    </div>
  )
}
