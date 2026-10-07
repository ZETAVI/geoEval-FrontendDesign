import { useState } from 'react'
import { Wireframe } from './wireframe/Wireframe'
import { Design } from './design/Design'
import { cx } from './design/shared'

export default function App() {
  const [view, setView] = useState<'proposals' | 'wireframe'>('proposals')
  return (
    <div className="min-h-screen bg-canvas p-4 md:p-8">
      <div className="mx-auto grid max-w-7xl gap-5">
        <nav className="flex items-center gap-1 self-start rounded-full border border-line bg-surface p-1 text-body" aria-label="视图">
          {([['proposals', '设计稿'], ['wireframe', '线框基线']] as const).map(([v, l]) => (
            <button key={v} onClick={() => setView(v)} aria-pressed={view === v} className={cx('rounded-full px-4 py-1.5', view === v ? 'bg-ink text-surface' : 'text-ink-2')}>{l}</button>
          ))}
        </nav>
        {/* 线框保持挂载，避免其交互引擎重复初始化 */}
        <div hidden={view !== 'wireframe'}><Wireframe /></div>
        {view === 'proposals' && <Design />}
      </div>
    </div>
  )
}
