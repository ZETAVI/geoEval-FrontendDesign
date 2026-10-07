import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowLeft, ArrowRight, Bell, BellRing, Check, FileText, Newspaper, RotateCcw } from 'lucide-react'
import { KIND_LABEL, METRICS as M, PLATFORM_NAMES, QUESTIONS, SAMPLES, TIER, tierOf } from './diag'
import { EASE, SPRING, rise, stagger } from './motion'
import { cx, type Page } from './shared'

/* 演示节奏：每个平台逐题作答，速度不同；真实耗时约 3 分钟 */
const SPEED = [2.2, 2.9, 3.5, 2.6, 3.1]
const TICK = 200
const endAt = (p: number, q: number) => (q + 1) * SPEED[p] * 1000
const TOTAL_MS = Math.max(...SPEED) * 4 * 1000

type St = 'wait' | 'busy' | 'done'
const stateOf = (t: number, p: number, q: number): St => (t >= endAt(p, q) ? 'done' : q === 0 || t >= endAt(p, q - 1) ? 'busy' : 'wait')

function Slot({ st, p, q }: { st: St; p: number; q: number }) {
  const r = SAMPLES[p][q].rank
  const tier = tierOf(r)
  return (
    <div className="relative grid h-14 place-items-center">
      <AnimatePresence mode="popLayout" initial={false}>
        {st === 'wait' && (
          <motion.div key="w" exit={{ opacity: 0 }} className="grid size-full place-items-center rounded-control border border-dashed border-mark text-eyebrow text-ink-3">等待</motion.div>
        )}
        {st === 'busy' && (
          <motion.div key="b" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
            className="relative grid size-full place-items-center overflow-hidden rounded-control bg-brand-soft text-eyebrow font-semibold text-brand ring-1 ring-brand/30">
            <motion.span aria-hidden className="absolute inset-y-0 w-1/3 bg-linear-to-r from-transparent via-brand/15 to-transparent" animate={{ x: ['-120%', '380%'] }} transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }} />
            <span className="relative flex items-center gap-1">提问中
              {[0, 1, 2].map((i) => <motion.i key={i} className="size-1 rounded-full bg-brand" animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 1, repeat: Infinity, delay: i * 0.18 }} />)}
            </span>
          </motion.div>
        )}
        {st === 'done' && (
          <motion.div key="d" initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 380, damping: 20 }}
            className={cx('grid size-full place-items-center rounded-control text-caption font-bold tabular-nums', TIER[tier].cell)}>
            {r ? `第 ${r} 位` : '未提及'}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Ring({ done, total }: { done: number; total: number }) {
  return (
    <div className="relative size-32">
      <svg viewBox="0 0 100 100" className="size-full -rotate-90" aria-hidden>
        <circle cx="50" cy="50" r="42" fill="none" className="stroke-sunken" strokeWidth="9" />
        <motion.circle cx="50" cy="50" r="42" fill="none" className="stroke-brand" strokeWidth="9" strokeLinecap="round" pathLength={1} strokeDasharray="1 1"
          initial={false} animate={{ strokeDashoffset: 1 - done / total }} transition={{ duration: 0.5, ease: EASE }} />
      </svg>
      <div className="absolute inset-0 grid place-content-center text-center" role="progressbar" aria-valuenow={done} aria-valuemin={0} aria-valuemax={total}>
        <b className="text-h1 font-black leading-none tabular-nums">{done}<span className="text-caption font-normal text-ink-2"> / {total}</span></b>
        <span className="mt-1 text-eyebrow text-ink-2">条回答</span>
      </div>
    </div>
  )
}

export function Running({ go }: { go: (p: Page) => void }) {
  const [t, setT] = useState(0)
  const [notify, setNotify] = useState(false)
  const finished = t >= TOTAL_MS
  useEffect(() => {
    if (finished) return
    const id = setInterval(() => setT((v) => Math.min(v + TICK, TOTAL_MS)), TICK)
    return () => clearInterval(id)
  }, [finished])

  const events = useMemo(
    () => SAMPLES.flatMap((row, p) => row.map((x, q) => ({ p, q, at: endAt(p, q), rank: x.rank }))).sort((a, b) => a.at - b.at),
    [],
  )
  const doneEvents = events.filter((e) => t >= e.at)
  const done = doneEvents.length
  const recent = doneEvents.slice(-4).reverse()
  const leftMin = Math.max(1, Math.ceil(((20 - done) * 9) / 60))
  const hits = doneEvents.filter((e) => e.rank).length

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="grid gap-6 px-5 pb-12 pt-6 md:px-10">
      <motion.header variants={rise} className="grid gap-5">
        <div className="flex items-center justify-between">
          <button onClick={() => go('home')} className="flex items-center gap-1.5 text-caption text-ink-2 hover:text-ink"><ArrowLeft className="size-3.5" />返回品牌服务</button>
          <button onClick={() => setT(0)} className="flex items-center gap-1 rounded-full border border-line px-3 py-1.5 text-caption text-ink-2 hover:bg-sunken"><RotateCcw className="size-3" />重播演示</button>
        </div>
        <div>
          <h1 className="text-[clamp(2rem,4vw,2.75rem)] font-black leading-tight tracking-tight">{finished ? '诊断完成' : '诊断进行中'}</h1>
          <p className="mt-2 text-body text-ink-2">{finished ? `${M.mentions} 条回答提到了你` : `5 个平台在回答 4 个问题，约 ${leftMin} 分钟`}</p>
        </div>
      </motion.header>

      <AnimatePresence>
        {finished && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-panel bg-brand p-5 text-on-brand shadow-raised">
              <p className="flex items-center gap-3 text-h3 font-semibold"><span className="grid size-8 place-items-center rounded-full bg-on-brand text-brand"><Check className="size-4" strokeWidth={3} /></span>20 条回答都收齐了，报告已生成</p>
              <button onClick={() => go('report')} className="flex h-11 items-center gap-2 rounded-full bg-on-brand px-6 text-body font-semibold text-brand">查看报告<ArrowRight className="size-4" /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        <motion.section variants={rise} className="rounded-panel border border-line bg-surface p-5 shadow-soft md:p-6">
          <h3 className="text-h2 font-bold">回答进度</h3>
          <p className="mb-4 text-caption text-ink-2">每收到一条回答，就揭晓你排第几</p>
          <div className="overflow-x-auto">
            <div className="grid min-w-[520px] grid-cols-[5.5rem_repeat(4,minmax(0,1fr))] items-center gap-2">
              <span />
              {QUESTIONS.map((_, q) => <b key={q} className="text-center text-caption text-brand">Q{q + 1}</b>)}
              {PLATFORM_NAMES.map((n, p) => (
                <div key={n} className="contents">
                  <b className="text-body">{n}</b>
                  {QUESTIONS.map((_, q) => <Slot key={q} st={stateOf(t, p, q)} p={p} q={q} />)}
                </div>
              ))}
            </div>
          </div>
          <ol className="mt-5 grid gap-1.5 border-t border-line pt-4 text-caption text-ink-2">
            {QUESTIONS.map((q, i) => (
              <li key={i} className="flex items-center gap-2"><b className="w-6 text-brand">Q{i + 1}</b><span>{q.text}</span><span className="ml-auto rounded-full bg-sunken px-1.5 py-0.5 text-eyebrow">{KIND_LABEL[q.kind]}</span></li>
            ))}
          </ol>
        </motion.section>

        <div className="grid content-start gap-4">
          <motion.section variants={rise} className="rounded-panel border border-line bg-surface p-5 shadow-soft">
            <div className="flex items-center gap-5">
              <Ring done={done} total={20} />
              <div>
                <p className="text-caption text-ink-2">已提到你</p>
                <p className="text-display font-black leading-none tabular-nums text-orange-ink">{hits}</p>
                <p className="mt-1 text-caption text-ink-2">条回答</p>
              </div>
            </div>
            <div className="mt-5 border-t border-line pt-4">
              <p className="mb-2 text-caption font-semibold">刚收到</p>
              <ul className="grid gap-1.5" aria-live="polite">
                <AnimatePresence initial={false} mode="popLayout">
                  {recent.length === 0 && <li className="text-caption text-ink-3">正在向 5 个平台提问…</li>}
                  {recent.map((e) => (
                    <motion.li layout key={`${e.p}-${e.q}`} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={SPRING}
                      className="flex items-center gap-2 text-caption">
                      <span className={cx('size-2 rounded-full', e.rank ? 'bg-orange' : 'bg-mark')} />
                      <b>{PLATFORM_NAMES[e.p]}</b><span className="text-ink-3">Q{e.q + 1}</span>
                      <span className="ml-auto text-ink-2">{e.rank ? `排第 ${e.rank} 位` : '没提到你'}</span>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            </div>
          </motion.section>

          <motion.section variants={rise} className="rounded-panel border border-line bg-surface p-5 shadow-soft">
            <h3 className="text-h3 font-bold">先做点别的</h3>
            <p className="text-caption text-ink-2">诊断在后台继续，完成会通知你</p>
            <button onClick={() => setNotify((n) => !n)} role="switch" aria-checked={notify}
              className={cx('mt-3 flex w-full items-center gap-3 rounded-control border px-3 py-2.5 text-left text-body transition-colors', notify ? 'border-brand bg-brand-soft text-brand' : 'border-line hover:bg-sunken')}>
              {notify ? <BellRing className="size-4" /> : <Bell className="size-4" />}
              <span className="flex-1 font-semibold">{notify ? '完成后会通知你' : '完成后通知我'}</span>
              <span className={cx('relative h-5 w-9 rounded-full transition-colors', notify ? 'bg-brand' : 'bg-mark')}>
                <motion.span layout transition={SPRING} className={cx('absolute top-0.5 size-4 rounded-full bg-surface', notify ? 'right-0.5' : 'left-0.5')} />
              </span>
            </button>
            <div className="mt-2 grid gap-1">
              {([['完善品牌资料', FileText], ['了解发布方式', Newspaper]] as const).map(([l, Icon]) => (
                <button key={l} onClick={() => go('home')} className="flex items-center gap-2 rounded-control px-3 py-2 text-body hover:bg-sunken"><Icon className="size-4 text-ink-3" />{l}<ArrowRight className="ml-auto size-3.5 text-ink-3" /></button>
              ))}
            </div>
          </motion.section>
        </div>
      </div>
    </motion.div>
  )
}
