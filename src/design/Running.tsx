import { useFlow } from './flow'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowDown, ArrowLeft, ArrowRight, Bell, BellRing, Check, FileText, Newspaper, RotateCcw } from 'lucide-react'
import { BRAND, KIND_LABEL, answerList, METRICS as M, PLATFORM_NAMES, QUESTIONS, SAMPLES, TIER, tierOf } from './diag'
import { EASE, SPRING, rise, stagger } from './motion'
import { cx, type Page } from './shared'

/* 演示节奏
 * 真实情况：20 个问题同时发出，平台差不多同时返回。
 * 演示里把“返回”拉开：回答按到达顺序一条条读出来（每条约 3 秒），总长约 1 分钟。
 * 表格里的格子与右侧记录同步：发出 → 等待 → 正在读这条 → 完成。 */
const TICK = 200
const LINE_MS = 420
const h = (i: number, k: number) => { const x = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return x - Math.floor(x) }
const ORDER = Array.from({ length: 20 }, (_, i) => i).sort((a, b) => h(a, 5) - h(b, 5))
type Line = { kind: 'head' | 'ans' | 'end'; text: string; me: boolean; off: number }
const BLOCKS = (() => {
  let cursor = 2600
  return ORDER.map((i) => {
    const p = Math.floor(i / 4), q = i % 4
    const x = SAMPLES[p][q]
    const list = answerList(x)
    const lines: Omit<Line, 'off'>[] = [
      { kind: 'head', text: `${QUESTIONS[q].text}`, me: false },
      ...list.map((it, k) => ({ kind: 'ans' as const, text: `${k + 1}. ${it.name}${it.note ? '：' + it.note : ''}`, me: it.me })),
      { kind: 'end', text: x.rank ? `${BRAND}排第 ${x.rank} 位` : `没有提到${BRAND}`, me: !!x.rank },
    ]
    const at = cursor
    const dur = lines.length * LINE_MS + 500
    cursor = at + dur + 120
    return { p, q, sent: h(i, 1) * 1400, at, end: at + dur, lines: lines.map((l, k) => ({ ...l, off: k * LINE_MS + 250 })) }
  })
})()
const CELLS = Array.from({ length: 20 }, (_, i) => {
  const b = BLOCKS.find((x) => x.p * 4 + x.q === i)!
  return { p: b.p, q: b.q, start: b.sent, samp: b.at - b.sent, parse: b.end - b.at, end: b.end }
})
const cell = (p: number, q: number) => CELLS[p * 4 + q]
const MERGE_MS = 1600
const TOTAL_MS = Math.max(...CELLS.map((c) => c.end)) + MERGE_MS
const fr = (v: number) => Math.min(1, Math.max(0, v))

type St = 'wait' | 'sample' | 'parse' | 'done'
const stateOf = (t: number, p: number, q: number): St => {
  const c = cell(p, q)
  return t >= c.end ? 'done' : t >= c.start + c.samp ? 'parse' : t >= c.start ? 'sample' : 'wait'
}

function Slot({ st, p, q }: { st: St; p: number; q: number }) {
  const r = SAMPLES[p][q].rank
  const tier = tierOf(r)
  return (
    <div className="relative grid h-14 place-items-center">
      <AnimatePresence mode="popLayout" initial={false}>
        {st === 'wait' && (
          <motion.div key="w" exit={{ opacity: 0 }} className="grid size-full place-items-center rounded-control border border-dashed border-mark text-eyebrow text-ink-3">等待</motion.div>
        )}
        {(st === 'sample' || st === 'parse') && (
          <motion.div key="b" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
            className={cx('relative grid size-full place-items-center overflow-hidden rounded-control text-eyebrow font-semibold text-brand ring-1', st === 'sample' ? 'bg-brand-soft ring-brand/30' : 'bg-brand/15 ring-brand/50')}>
            <motion.span aria-hidden className="absolute inset-y-0 w-1/3 bg-linear-to-r from-transparent via-brand/15 to-transparent" animate={{ x: ['-120%', '380%'] }} transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }} />
            <span className="relative flex items-center gap-1">{st === 'sample' ? '提问中' : '解析中'}
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

/* 里程碑：进度按“做完了什么”推进，而不是按时间猜。位置 = 该节点完成时的进度 */
const MILESTONES = [
  { at: 0.08, label: '问题已送达', eta: '约 10 秒' },
  { at: 0.55, label: '平台回答中', eta: '约 1–3 分钟' },
  { at: 0.88, label: '解析排位', eta: '约 1–2 分钟' },
  { at: 1, label: '生成报告', eta: '约 20 秒' },
]
const REAL_MIN = 4
const mmss = (ms: number) => `${Math.floor(ms / 60000)} 分 ${String(Math.floor((ms % 60000) / 1000)).padStart(2, '0')} 秒`

function Bar({ shown, counts, finished, t }: { shown: number; counts: { sample: number; parse: number; done: number }; finished: boolean; t: number }) {
  const pct = Math.round(shown * 100)
  const cur = MILESTONES.findIndex((m) => shown < m.at)
  const stage = finished ? MILESTONES.length : cur === -1 ? MILESTONES.length : cur
  const elapsed = (t / TOTAL_MS) * REAL_MIN * 60000
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <b className="text-display font-black leading-none tabular-nums" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>{pct}<span className="text-h2 text-ink-2">%</span></b>
        <p className="text-caption text-ink-2">已用 <b className="tabular-nums text-ink">{mmss(elapsed)}</b> · 通常需要 3–5 分钟 <span className="ml-1 rounded-full bg-sunken px-2 py-0.5 text-eyebrow text-ink-3">演示已加速</span></p>
      </div>
      <div className="relative mt-5 h-3 rounded-full bg-sunken">
        <motion.div className="relative h-full overflow-hidden rounded-full bg-brand" initial={false} animate={{ width: `${shown * 100}%` }} transition={{ duration: 0.45, ease: EASE }}>
          {!finished && <motion.span aria-hidden className="absolute inset-y-0 w-16 bg-linear-to-r from-transparent via-on-brand/50 to-transparent" animate={{ x: ['-100%', '400%'] }} transition={{ duration: 1.6, repeat: Infinity, ease: 'linear' }} />}
        </motion.div>
        {MILESTONES.slice(0, -1).map((m) => (
          <span key={m.label} aria-hidden className={cx('absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-surface transition-colors', shown >= m.at ? 'bg-brand' : 'bg-mark')} style={{ left: `${m.at * 100}%` }} />
        ))}
      </div>
      <ol className="mt-4 grid grid-cols-4 gap-2" aria-label="诊断阶段">
        {MILESTONES.map((m, i) => (
          <li key={m.label} aria-current={i === stage && !finished ? 'step' : undefined} className="grid gap-0.5 text-caption">
            <span className={cx('flex items-center gap-1.5 font-semibold', i < stage ? 'text-brand' : i === stage ? 'text-ink' : 'text-ink-3')}>
              <span className={cx('grid size-4 place-items-center rounded-full text-[10px]', i < stage ? 'bg-brand text-on-brand' : i === stage ? 'bg-brand-soft text-brand ring-1 ring-brand/40' : 'border border-mark')}>
                {i < stage ? <Check className="size-2.5" strokeWidth={4} /> : i + 1}
              </span>{m.label}
            </span>
            <span className="pl-5 text-eyebrow text-ink-3">{i < stage ? '已完成' : m.eta}</span>
          </li>
        ))}
      </ol>
      <p className="mt-4 flex flex-wrap gap-x-4 border-t border-line pt-3 text-caption text-ink-2" aria-live="polite">
        <span>已收齐 <b className="tabular-nums text-ink">{counts.done}</b> / 20 条回答</span>
        {!finished && <><span>回答中 <b className="tabular-nums text-ink">{counts.sample}</b></span><span>解析中 <b className="tabular-nums text-ink">{counts.parse}</b></span></>}
      </p>
    </div>
  )
}

/* 回答记录：日志 + 回答块，可上下滚动；跟随最新，手动上滑后停住并给“回到最新” */
type Row = { at: number; kind: 'log' | 'head' | 'ans' | 'end'; p: number; q: number; text: string; me: boolean }
const ROWS: Row[] = BLOCKS.flatMap((b) => {
  const nm = PLATFORM_NAMES[b.p]
  const sm = SAMPLES[b.p][b.q]
  const r: Row[] = [
    { at: b.sent, kind: 'log', p: b.p, q: b.q, text: `已向${nm}发送问题 Q${b.q + 1}`, me: false },
    { at: b.at, kind: 'log', p: b.p, q: b.q, text: `收到${nm}对 Q${b.q + 1} 的回答`, me: false },
    ...b.lines.map((l) => ({ at: b.at + l.off, kind: l.kind, p: b.p, q: b.q, text: l.text, me: l.me })),
    { at: b.end, kind: 'log', p: b.p, q: b.q, text: `解析完成：${sm.rank ? `排第 ${sm.rank} 位` : '未提及'}`, me: false },
  ]
  return r
}).sort((a, b) => a.at - b.at)
const FILTERS = [['all', '全部'], ['ans', '回答'], ['log', '日志']] as const
const fmt = (ms: number) => `${String(Math.floor(ms / 60000)).padStart(2, '0')}:${String(Math.floor((ms % 60000) / 1000)).padStart(2, '0')}`

function Record({ t, finished }: { t: number; finished: boolean }) {
  const [f, setF] = useState<'all' | 'ans' | 'log'>('all')
  const [stick, setStick] = useState(true)
  const box = useRef<HTMLDivElement>(null)
  const n = ROWS.findIndex((r) => r.at > t)
  const count = n === -1 ? ROWS.length : n
  const rows = useMemo(() => ROWS.slice(0, count).filter((r) => f === 'all' || (f === 'log' ? r.kind === 'log' : r.kind !== 'log')), [count, f])
  useLayoutEffect(() => {
    const el = box.current
    if (el && stick) el.scrollTo({ top: el.scrollHeight, behavior: rows.length > 1 ? 'smooth' : 'auto' })
  }, [rows.length, stick])
  const onScroll = () => { const el = box.current; if (el) setStick(el.scrollHeight - el.scrollTop - el.clientHeight < 48) }
  const cur = BLOCKS.find((b) => t >= b.at && t < b.end)
  return (
    <motion.section variants={rise} className="flex h-[min(640px,calc(100vh-3rem))] flex-col overflow-hidden rounded-panel border border-line bg-surface shadow-soft lg:sticky lg:top-6">
      <div className="border-b border-line px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-body font-bold">回答记录</h3>
          <div role="tablist" aria-label="记录筛选" className="flex rounded-full bg-sunken p-0.5 text-eyebrow">
            {FILTERS.map(([k, l]) => (
              <button key={k} role="tab" aria-selected={f === k} onClick={() => setF(k)} className={cx('rounded-full px-2.5 py-1 transition-colors', f === k ? 'bg-surface font-semibold text-brand shadow-soft' : 'text-ink-2')}>{l}</button>
            ))}
          </div>
        </div>
        <p className="mt-1 flex items-center gap-1.5 text-eyebrow text-ink-3">
          {!finished && <i className="size-1.5 animate-pulse rounded-full bg-brand" />}
          {finished ? `共 ${BLOCKS.length} 条回答，可回看` : cur ? `正在读 ${PLATFORM_NAMES[cur.p]} · Q${cur.q + 1}` : '等待平台返回…'}
          <span className="ml-auto">按到达顺序回放</span>
        </p>
      </div>
      <div className="relative min-h-0 flex-1">
        <div ref={box} onScroll={onScroll} role="log" aria-label="回答记录" tabIndex={0} className="h-full overflow-y-auto overscroll-contain px-4 py-3 outline-none focus-visible:ring-2 focus-visible:ring-brand/40">
          {rows.length === 0 && <p className="py-10 text-center text-caption text-ink-3">问题已发出，回答很快开始返回。</p>}
          <ul className="grid gap-1">
            {rows.map((r) => {
              const last = !finished && r === rows[rows.length - 1]
              const key = `${r.p}-${r.q}-${r.kind}-${r.at}`
              if (r.kind === 'log') return (
                <motion.li key={key} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2 font-mono text-eyebrow leading-5 text-ink-3">
                  <span className="shrink-0 tabular-nums">{fmt(r.at)}</span><span className="min-w-0">{r.text}</span>
                </motion.li>
              )
              if (r.kind === 'head') return (
                <motion.li key={key} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, ease: EASE }} className="mt-3 flex items-start gap-2 rounded-control bg-brand-soft px-3 py-2">
                  <span className="mt-0.5 shrink-0 rounded-full bg-brand px-2 py-0.5 text-eyebrow font-semibold text-on-brand">{PLATFORM_NAMES[r.p]}</span>
                  <span className="min-w-0 text-caption font-semibold text-brand"><span className="mr-1 tabular-nums">Q{r.q + 1}</span>{r.text}</span>
                </motion.li>
              )
              return (
                <motion.li key={key} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, ease: EASE }}
                  className={cx('ml-2 rounded-control border-l-2 py-1 pl-3 pr-2 text-caption leading-relaxed', r.kind === 'end' ? (r.me ? 'border-orange bg-orange-soft font-semibold text-orange-ink' : 'border-mark font-semibold text-ink-2') : r.me ? 'border-orange bg-orange-soft/60 font-semibold text-orange-ink' : 'border-line text-ink-2')}>
                  {r.kind === 'end' && <span className="mr-1.5 text-ink-3">结论</span>}{r.text}
                  {last && <motion.i className="ml-1 inline-block h-3.5 w-1 translate-y-0.5 bg-ink-2" animate={{ opacity: [1, 0] }} transition={{ duration: 0.6, repeat: Infinity }} />}
                </motion.li>
              )
            })}
          </ul>
        </div>
        <AnimatePresence>
          {!stick && (
            <motion.button initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} onClick={() => { setStick(true); box.current?.scrollTo({ top: box.current.scrollHeight, behavior: 'smooth' }) }}
              className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-brand px-3.5 py-1.5 text-caption font-semibold text-on-brand shadow-raised">
              <ArrowDown className="size-3.5" />回到最新
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  )
}

export function Running({ go }: { go: (p: Page) => void }) {
  const flow = useFlow()
  const { setDiagnosed } = flow
  const [t, setT] = useState(0)
  const [notify, setNotify] = useState(false)
  const [speed, setSpeed] = useState<1 | 3>(1)
  const finished = t >= TOTAL_MS
  useEffect(() => {
    if (finished) return
    const id = setInterval(() => setT((v) => Math.min(v + TICK * speed, TOTAL_MS)), TICK)
    return () => clearInterval(id)
  }, [finished, speed])

  const events = useMemo(
    () => SAMPLES.flatMap((row, p) => row.map((x, q) => ({ p, q, at: cell(p, q).end, rank: x.rank }))).sort((a, b) => a.at - b.at),
    [],
  )
  const doneEvents = events.filter((e) => t >= e.at)
  const done = doneEvents.length
  const sampF = CELLS.reduce((a, c) => a + fr((t - c.start) / c.samp), 0) / 20
  const parseF = CELLS.reduce((a, c) => a + fr((t - c.start - c.samp) / c.parse), 0) / 20
  const lastEnd = Math.max(...CELLS.map((c) => c.end))
  const frac = 0.08 * fr(t / 1200) + 0.47 * Math.pow(sampF, 0.85) + 0.33 * parseF + 0.12 * fr((t - lastEnd) / MERGE_MS)
  const top = useRef(0)
  const raw = finished ? 1 : Math.min(0.99, frac)
  if (t === 0) top.current = 0
  top.current = Math.max(top.current, raw)
  const counts = { sample: 0, parse: 0, done }
  CELLS.forEach((c) => { const s = stateOf(t, c.p, c.q); if (s === 'sample') counts.sample++; else if (s === 'parse') counts.parse++ })
  const eta = frac < 0.45 ? '2–4 分钟' : frac < 0.85 ? '1–2 分钟' : '不到 1 分钟'
  const hits = doneEvents.filter((e) => e.rank).length

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="grid gap-6 px-5 pb-12 pt-6 md:px-10">
      <motion.header variants={rise} className="grid gap-5">
        <div className="flex items-center justify-between">
          <button onClick={() => go('home')} className="flex items-center gap-1.5 text-caption text-ink-2 hover:text-ink"><ArrowLeft className="size-3.5" />返回品牌服务</button>
          <div className="flex items-center gap-2">
            <div role="radiogroup" aria-label="演示速度" className="flex rounded-full bg-sunken p-0.5 text-caption">
              {([1, 3] as const).map((v) => <button key={v} role="radio" aria-checked={speed === v} onClick={() => setSpeed(v)} className={cx('rounded-full px-3 py-1 tabular-nums transition-colors', speed === v ? 'bg-surface font-semibold text-brand shadow-soft' : 'text-ink-2')}>{v}×</button>)}
            </div>
            <button onClick={() => { top.current = 0; setT(0) }} className="flex items-center gap-1 rounded-full border border-line px-3 py-1.5 text-caption text-ink-2 hover:bg-sunken"><RotateCcw className="size-3" />重播演示</button>
          </div>
        </div>
        <div>
          <h1 className="text-[clamp(2rem,4vw,2.75rem)] font-black leading-tight tracking-tight">{finished ? '诊断完成' : '诊断进行中'}</h1>
          <p className="mt-2 text-body text-ink-2">{finished ? `${M.mentions} 条回答提到了你` : `20 条回答同时进行，预计还需 ${eta}`}</p>
        </div>
      </motion.header>

      <AnimatePresence>
        {finished && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-panel bg-brand p-5 text-on-brand shadow-raised">
              <p className="flex items-center gap-3 text-h3 font-semibold"><span className="grid size-8 place-items-center rounded-full bg-on-brand text-brand"><Check className="size-4" strokeWidth={3} /></span>20 条回答都收齐了，报告已生成</p>
              <button onClick={() => { setDiagnosed(true); go('report') }} className="flex h-11 items-center gap-2 rounded-full bg-on-brand px-6 text-body font-semibold text-brand">查看报告<ArrowRight className="size-4" /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
        <div className="grid gap-4">
        <motion.section variants={rise} className="rounded-panel border border-line bg-surface p-5 shadow-soft md:p-6">
          <Bar shown={top.current} counts={counts} finished={finished} t={t} />
        </motion.section>
        <motion.section variants={rise} className="rounded-panel border border-line bg-surface p-5 shadow-soft md:p-6">
          <h3 className="text-h2 font-bold">回答进度</h3>
          <p className="mb-4 text-caption text-ink-2">收到一条回答，就显示你排第几。已有 {hits} 条提到你。</p>
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

          <motion.section variants={rise} className="rounded-panel border border-line bg-surface p-5 shadow-soft">
            <h3 className="text-h3 font-bold">先做别的事</h3>
            <p className="text-caption text-ink-2">离开页面，诊断也会继续</p>
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
                <button key={l} onClick={() => (l === '了解发布方式' ? flow.go('publish', { tab: 'library' }) : flow.go('content', { tab: 'profile' }))} className="flex items-center gap-2 rounded-control px-3 py-2 text-body hover:bg-sunken"><Icon className="size-4 text-ink-3" />{l}<ArrowRight className="ml-auto size-3.5 text-ink-3" /></button>
              ))}
            </div>
          </motion.section>
        </div>
        <Record t={t} finished={finished} />
      </div>
    </motion.div>
  )
}
