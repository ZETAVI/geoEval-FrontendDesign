import { AnimatePresence, MotionConfig, motion } from 'motion/react'
import { cx, type Page } from './shared'
import { TopBar } from './TopBar'
import { OrderDetail } from './Orders'
import { Help } from './Help'
import { Report } from './Report'
import { Home } from './Home'
import { Points } from './Points'
import { Running } from './Running'
import { Content } from './Content'
import { Publish } from './Publish'
import { RechargeSheet } from './ui'
import { FlowProvider, STATE_LABEL, useFlow, type BrandState } from './flow'
import { EASE } from './motion'

const PAGES: [Page, string][] = [['home', '服务首页'], ['running', '诊断进行中'], ['report', '诊断报告'], ['content', '品牌内容'], ['publish', '媒体发布'], ['points', '积分账户']]
const STATES = Object.keys(STATE_LABEL) as BrandState[]
const SERVICE: Partial<Record<Page, string>> = { content: 'content', publish: 'publish', order: 'publish' }

function Stage() {
  const { page, go, balance, setBalance, state, preset } = useFlow()
  return (
    <>
      <div className="grid gap-2 text-caption">
        <nav className="flex flex-wrap items-center gap-2" aria-label="设计稿页面">
          <span className="w-16 text-ink-3">评审页面</span>
          {PAGES.map(([k, l]) => (
            <button key={k} onClick={() => go(k)} aria-pressed={page === k} className={cx('rounded-full border px-3 py-1', page === k ? 'border-brand bg-brand-soft font-semibold text-brand' : 'border-line bg-surface text-ink-2 hover:bg-sunken')}>{l}</button>
          ))}
        </nav>
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="演示：品牌所处位置">
          <span className="w-16 text-ink-3">品牌状态</span>
          {STATES.map((k) => (
            <button key={k} onClick={() => preset(k)} aria-pressed={state === k} className={cx('rounded-full border px-3 py-1', state === k ? 'border-ink bg-ink font-semibold text-surface' : 'border-line bg-surface text-ink-2 hover:bg-sunken')}>{STATE_LABEL[k]}</button>
          ))}
        </div>
      </div>
      <div data-service={SERVICE[page]} className="overflow-clip rounded-panel border border-line bg-surface text-ink shadow-raised">
        <TopBar page={page} go={go} balance={balance} onProfile={() => go('content', { tab: 'profile' })} />
        <AnimatePresence mode="wait">
          <motion.div key={page} onAnimationStart={() => scrollTo({ top: 0 })} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25, ease: EASE }}>
            {page === 'home' ? <Home /> : page === 'report' ? <Report go={go} /> : page === 'running' ? <Running go={go} /> : page === 'content' ? <Content /> : page === 'publish' ? <Publish /> : page === 'order' ? <OrderDetail /> : page === 'help' ? <Help /> : <Points balance={balance} setBalance={setBalance} />}
          </motion.div>
        </AnimatePresence>
      </div>
      <RechargeSheet />
    </>
  )
}

/** 光感构成 · 设计稿 */
export function Design() {
  return (
    <MotionConfig reducedMotion="user">
      <FlowProvider><Stage /></FlowProvider>
    </MotionConfig>
  )
}
