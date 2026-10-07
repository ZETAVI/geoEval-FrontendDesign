import { useState } from 'react'
import { AnimatePresence, MotionConfig, motion } from 'motion/react'
import { TopBar, cx, type Page } from './shared'
import { Report } from './Report'
import { Home } from './Home'
import { Points } from './Points'
import { Running } from './Running'
import { EASE } from './motion'

const PAGES: [Page, string][] = [['home', '服务首页'], ['running', '诊断进行中'], ['report', '诊断报告'], ['points', '积分账户']]

/** 光感构成 · 设计稿：服务首页与积分账户 */
export function Design() {
  const [page, setPage] = useState<Page>('home')
  const [balance, setBalance] = useState(2800)
  return (
    <MotionConfig reducedMotion="user">
      <nav className="flex flex-wrap items-center gap-2 text-caption" aria-label="设计稿页面">
        <span className="text-ink-3">评审页面</span>
        {PAGES.map(([k, l]) => (
          <button key={k} onClick={() => setPage(k)} aria-pressed={page === k} className={cx('rounded-full border px-3 py-1', page === k ? 'border-brand bg-brand-soft font-semibold text-brand' : 'border-line bg-surface text-ink-2 hover:bg-sunken')}>{l}</button>
        ))}
      </nav>
      <div className="overflow-hidden rounded-panel border border-line bg-surface text-ink shadow-raised">
        <TopBar page={page} go={setPage} balance={balance} />
        <AnimatePresence mode="wait">
          <motion.div key={page} onAnimationStart={() => scrollTo({ top: 0 })} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25, ease: EASE }}>
            {page === 'home' ? <Home go={setPage} /> : page === 'report' ? <Report go={setPage} /> : page === 'running' ? <Running go={setPage} /> : <Points balance={balance} setBalance={setBalance} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </MotionConfig>
  )
}
