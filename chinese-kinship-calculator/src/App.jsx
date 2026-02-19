import { useState } from 'react'
import { BUTTON_SECTIONS, isCousinScenario, resolveRelationship } from './utils/resolver'
import './App.css'

function App() {
  const [path, setPath] = useState([])
  const [result, setResult] = useState(null)  // null = not computed yet, '' = empty result, string = answer
  const [relativeAge, setRelativeAge] = useState(null) // 'older' | 'younger' | null

  const tokenToLabel = Object.fromEntries(
    BUTTON_SECTIONS.flatMap((s) => s.buttons.map((b) => [b.token, b.label])),
  )

  const handleTokenClick = (token) => {
    // If we just showed a result, clear and start fresh (calculator behavior)
    if (result !== null) {
      setPath([token])
      setResult(null)
      setRelativeAge(null)
    } else {
      setPath([...path, token])
    }
  }

  const handleEquals = () => {
    if (path.length === 0) return
    const resolved = resolveRelationship(path, relativeAge)
    setResult(resolved)
  }

  const handleClear = () => {
    setPath([])
    setResult(null)
    setRelativeAge(null)
  }

  const handleBackspace = () => {
    if (result !== null) {
      setResult(null)
    }
    if (path.length > 0) {
      const newPath = path.slice(0, -1)
      setPath(newPath)
      if (!isCousinScenario(newPath)) {
        setRelativeAge(null)
      }
    }
  }

  const equationDisplay = path.length > 0
    ? path
      .map((token) => tokenToLabel[token] ?? token)
      .join(' → ')
    : ''

  const needsRelativeAge = isCousinScenario(path)
  const canCompute = path.length > 0 && (!needsRelativeAge || !!relativeAge)

  return (
    <div className="min-h-screen bg-[#1c1c1e] flex items-center justify-center p-6">
      <div className="w-full max-w-[340px]">
        {/* App Title */}
        <h1 className="text-2xl font-semibold text-center text-white/90 mb-6 tracking-tight">
          叫对了吗？
        </h1>

        {/* Calculator Body - macOS style */}
        <div className="bg-[#2d2d2f] rounded-[20px] p-5 shadow-2xl border border-white/5">
          {/* Display */}
          <div className="bg-[#1c1c1e] rounded-2xl p-5 mb-5 min-h-[100px] flex flex-col justify-end">
            {/* Equation line */}
            <div className="text-white/50 text-right text-lg font-light min-h-[28px] mb-1 tabular-nums">
              {equationDisplay || ' '}
            </div>
            {/* Result line - only show when = is pressed */}
            <div className="text-white text-4xl font-light text-right tabular-nums truncate">
              {result !== null ? result : '0'}
            </div>
          </div>

          {/* Older/Younger selector (only for cousin scenarios) */}
          {needsRelativeAge && (
            <div className="mb-4 bg-[#1c1c1e] rounded-2xl p-4 border border-white/5">
              <div className="text-white/80 text-sm mb-2">
                这个人比你年纪？
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRelativeAge('older')}
                  className={`calc-btn ${
                    relativeAge === 'older'
                      ? 'bg-[#ff9f0a] hover:bg-[#ffb340] active:bg-[#cc7e08]'
                      : 'bg-[#505050] hover:bg-[#5a5a5c] active:bg-[#3d3d3f]'
                  }`}
                >
                  大
                </button>
                <button
                  type="button"
                  onClick={() => setRelativeAge('younger')}
                  className={`calc-btn ${
                    relativeAge === 'younger'
                      ? 'bg-[#ff9f0a] hover:bg-[#ffb340] active:bg-[#cc7e08]'
                      : 'bg-[#505050] hover:bg-[#5a5a5c] active:bg-[#3d3d3f]'
                  }`}
                >
                  小
                </button>
              </div>
            </div>
          )}

          {/* Button Grid */}
          <div className="space-y-4">
            {/* Row 1: Clear, Backspace, spacer, Equals */}
            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={handleClear}
                className="calc-btn bg-[#505050] hover:bg-[#5a5a5c] active:bg-[#3d3d3f]"
              >
                清除
              </button>
              <button
                onClick={handleBackspace}
                className="calc-btn bg-[#505050] hover:bg-[#5a5a5c] active:bg-[#3d3d3f] col-span-2"
              >
                ⌫
              </button>
              <button
                onClick={handleEquals}
                disabled={!canCompute}
                className="calc-btn bg-[#ff9f0a] hover:bg-[#ffb340] active:bg-[#cc7e08] disabled:opacity-50 disabled:cursor-not-allowed text-white"
              >
                =
              </button>
            </div>

            {BUTTON_SECTIONS.map((section) => (
              <div key={section.title} className="flex flex-col gap-1.5">
                <div className="text-white/60 text-xs font-medium px-1">{section.title}</div>
                <div className="grid grid-cols-4 gap-2">
                  {section.buttons.map((b) => {
                    const colSpan =
                      section.buttons.length === 2 ? 'col-span-2' : ''
                    return (
                      <button
                        key={b.token}
                        onClick={() => handleTokenClick(b.token)}
                        className={`calc-btn bg-[#505050] hover:bg-[#5a5a5c] active:bg-[#3d3d3f] ${colSpan}`}
                      >
                        {b.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
