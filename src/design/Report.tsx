import { useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowLeft, ArrowRight, ChevronRight, CircleHelp, FileSearch, Lock, Link2 } from 'lucide-react'
import { Impression } from './Impression'
import { PositionMap, type Sel } from './PositionMap'
import { KIND_LABEL, METRICS as M, PLATFORM_NAMES, QUESTIONS, SAMPLES, TIER, questionHits, tierOf } from './diag'
import { CountUp, EASE, rise, SPRING, stagger } from './motion'
import { Stars, cx, type Page } from './shared'

type TabKey = 'overview' | 'platform' | 'impression'
const TABS: [TabKey, string][] = [['overview', '结果总览'], ['platform', '平台排位'], ['impression', '品牌印象']]

/* ── 四个指标：各用不同的小图形，一眼分清各自含义 ── */
function Tile({ title, desc, children, viz }: { title: string; desc: string; children: ReactNode; viz: ReactNode }) {
  return (
    <div className="flex flex-col justify-between gap-3 rounded-control bg-surface/85 p-4 ring-1 ring-line backdrop-blur-sm">
      <div>
        <p className="text-caption font-semibold text-ink">{title}</p>
        <p className="text-eyebrow text-ink-2">{desc}</p>
      </div>
      <p className="flex items-baseline gap-1 text-h1 font-black leading-none tabular-nums">{children}</p>
      <div className="h-6">{viz}</div>
    </div>
  )
}

function Waffle() {
  const flat = SAMPLES.flat()
  return (
    <ul className="grid grid-cols-10 gap-1" aria-hidden>
      {flat.map((x, i) => (
        <motion.li key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5 + i * 0.025, ...SPRING }}
          className={cx('h-2.5 rounded-xs', x.rank ? 'bg-orange' : 'bg-mark')} />
      ))}
    </ul>
  )
}
function Dots() {
  return (
    <ul className="flex items-center gap-1.5" aria-hidden>
      {SAMPLES.map((row, i) => (
        <motion.li key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.6 + i * 0.08, ...SPRING }}
          className={cx('grid size-6 place-items-center rounded-full text-eyebrow font-bold', row.some((x) => x.rank) ? 'bg-brand text-on-brand' : 'border border-dashed border-mark text-ink-3')}>
          {PLATFORM_NAMES[i][0]}
        </motion.li>
      ))}
    </ul>
  )
}
function Ruler() {
  const pos = ((M.avgRank - 1) / 7) * 100
  return (
    <div className="relative mt-2.5 h-1.5 rounded-full bg-linear-to-r from-orange via-orange-soft to-sunken" aria-hidden>
      <motion.span initial={{ left: '0%', opacity: 0 }} animate={{ left: `${pos}%`, opacity: 1 }} transition={{ delay: 0.7, duration: 0.9, ease: EASE }}
        className="absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-ink bg-surface" />
    </div>
  )
}
function Split() {
  return (
    <div className="grid gap-1 text-eyebrow text-ink-2" aria-hidden>
      {[['找品牌', M.findRate, 'bg-orange'], ['问到你', Math.round((M.askHits / M.askTotal) * 100), 'bg-brand']].map(([l, v, c], i) => (
        <span key={l as string} className="flex items-center gap-2">
          <span className="w-10">{l}</span>
          <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-sunken">
            <motion.span initial={{ scaleX: 0 }} animate={{ scaleX: (v as number) / 100 }} transition={{ delay: 0.7 + i * 0.15, duration: 0.8, ease: EASE }} className={cx('block h-full origin-left rounded-full', c as string)} />
          </span>
          <span className="w-8 text-right tabular-nums">{v}%</span>
        </span>
      ))}
    </div>
  )
}

function Hero() {
  const [how, setHow] = useState(false)
  return (
    <motion.section variants={rise} className="grid gap-6 rounded-panel border border-line bg-linear-to-br from-brand-soft via-surface to-surface p-6 shadow-soft md:p-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
      <div className="flex flex-col">
        <p className="flex items-center gap-1.5 text-caption text-ink-2">
          AI 推荐指数
          <button onClick={() => setHow((h) => !h)} aria-expanded={how} aria-label="指数怎么算" className="text-ink-3 hover:text-ink"><CircleHelp className="size-3.5" /></button>
        </p>
        <div className="mt-1 flex flex-wrap items-baseline gap-x-2">
          <CountUp to={3.5} decimals={1} className="text-[clamp(3.5rem,6vw,4.5rem)] font-black leading-none text-brand tabular-nums" />
          <span className="text-h2 text-ink-2">/ 5</span>
          <Stars value={3.5} className="ml-2" />
        </div>
        <AnimatePresence>
          {how && (
            <motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mt-3 overflow-hidden rounded-control bg-surface px-3 py-2 text-caption text-ink-2 ring-1 ring-line">
              综合提及率、平台覆盖和排位得出：提到你的回答越多、排得越靠前，分数越高。
            </motion.p>
          )}
        </AnimatePresence>
        <p className="mt-5 max-w-md text-h3 font-semibold leading-relaxed">
          用户找家政时，只有 <b className="text-orange-ink underline decoration-orange decoration-2 underline-offset-4">{M.findRate}%</b> 的回答会提到你；直接问你的名字，AI 才认识你。
        </p>
        <p className="mt-auto pt-5 text-caption text-ink-3">反映本次采样中 AI 的回答，不代表长期或保证性结果。</p>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Tile title="提及率" desc="20 条回答里有你的比例" viz={<Waffle />}>
          <CountUp to={M.mentionRate} /><span className="text-caption font-normal text-ink-2">% · {M.mentions} / {M.total}</span>
        </Tile>
        <Tile title="平台覆盖" desc="提到你的平台数量" viz={<Dots />}>
          <CountUp to={M.platformsHit} /><span className="text-caption font-normal text-ink-2">/ {M.platforms} 个平台</span>
        </Tile>
        <Tile title="平均排位" desc="提到你时排第几" viz={<Ruler />}>
          <span className="text-caption font-normal text-ink-2">第</span><CountUp to={M.avgRank} decimals={1} /><span className="text-caption font-normal text-ink-2">位 · 前三 {M.topCount} 次</span>
        </Tile>
        <Tile title="主动提及率" desc="没点你名字时提到你" viz={<Split />}>
          <CountUp to={M.findRate} /><span className="text-caption font-normal text-ink-2">% · {M.findHits} / {M.findTotal}</span>
        </Tile>
      </div>
    </motion.section>
  )
}

/* ── 总览：4 个问题一行一个，全文可读，5 个平台的排位一眼看完 ── */
function QuestionRows({ open }: { open: (q: number) => void }) {
  return (
    <section className="rounded-panel border border-line bg-surface p-6 shadow-soft">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h3 className="text-h2 font-bold">问题结果</h3>
          <p className="text-caption text-ink-2">每个问题，5 个平台怎么答</p>
        </div>
        <ul className="flex items-center gap-3 text-eyebrow text-ink-2">
          {(['top', 'mid', 'low', 'none'] as const).map((t) => <li key={t} className="flex items-center gap-1.5"><span className={cx('size-3 rounded-full', TIER[t].cell)} />{TIER[t].label}</li>)}
        </ul>
      </div>
      <div className="mt-4 hidden grid-cols-[1fr_auto_7rem] items-end gap-4 px-3 text-eyebrow text-ink-3 md:grid">
        <span />
        <span className="flex gap-2">{PLATFORM_NAMES.map((n) => <span key={n} className="w-11 text-center">{n.length > 3 ? n.slice(0, 2) : n}</span>)}</span>
        <span />
      </div>
      <ul className="mt-1 md:mt-0">
        {QUESTIONS.map((q, qi) => (
          <li key={qi} className="border-t border-line/70 first:border-t-0">
            <button onClick={() => open(qi)} className="group grid w-full items-center gap-3 rounded-control px-3 py-3.5 text-left transition-colors hover:bg-sunken/70 md:grid-cols-[1fr_auto_7rem] md:gap-4">
              <span className="flex items-start gap-3">
                <b className="mt-0.5 w-6 shrink-0 text-caption text-brand">Q{qi + 1}</b>
                <span>
                  <span className="text-body font-semibold leading-snug">{q.text}</span>
                  <small className="mt-0.5 block text-eyebrow text-ink-3">{KIND_LABEL[q.kind]}</small>
                </span>
              </span>
              <span className="flex gap-2 pl-9 md:pl-0">
                {SAMPLES.map((row, p) => {
                  const r = row[qi].rank
                  return (
                    <motion.span key={p} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 + (qi * 5 + p) * 0.03, ...SPRING }}
                      title={`${PLATFORM_NAMES[p]}：${r ? `第 ${r} 位` : '未提及'}`}
                      className={cx('grid size-11 place-items-center rounded-control text-caption font-bold tabular-nums', TIER[tierOf(r)].cell)}>
                      {r ?? '—'}
                    </motion.span>
                  )
                })}
              </span>
              <span className="flex items-center justify-between gap-1 pl-9 text-caption text-ink-2 md:pl-0">
                <span><b className="text-ink tabular-nums">{questionHits(qi)} / 5</b> 提到你</span>
                <ChevronRight className="size-4 text-ink-3 transition-transform group-hover:translate-x-0.5" />
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}

const GLANCE = [
  { tab: 'impression' as const, title: '印象关键词', desc: '流程规范是优点，范围不清是短板', chips: [['流程规范', 'pos'], ['培训到位', 'pos'], ['范围不清', 'neg'], ['评价较少', 'neg']] as const },
  { tab: 'impression' as const, title: '同场品牌', desc: '你在 5 个品牌里排第 4', chips: [['阿姨帮 14', 'peer'], ['管家帮 11', 'peer'], ['天鹅到家 9', 'peer'], ['你 6', 'me']] as const },
]
const CHIP = { pos: 'bg-mint-soft text-mint', neg: 'bg-danger-soft text-danger', peer: 'bg-sunken text-ink-2', me: 'bg-brand text-on-brand' }

const DIRECTIONS = [
  { n: 1, title: '补全服务范围', desc: '3 条回答没说清你服务哪些区域', proof: 'Q3 · 豆包、DeepSeek、Kimi', how: '在核心文章补充区域、项目和价格', cta: '完善文章', to: 'home' as const },
  { n: 2, title: '增加媒体报道', desc: 'AI 更常推荐有公开报道的品牌', proof: 'Q1、Q2 · 阿姨帮、管家帮', how: '通过媒体发布补充客观报道', cta: '选择发布方式', to: 'home' as const },
]

function Directions({ go }: { go: (p: Page) => void }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {DIRECTIONS.map((d) => (
        <motion.article key={d.n} whileHover={{ y: -3 }} transition={SPRING} className="group flex flex-col gap-4 rounded-panel border border-line bg-surface p-6 shadow-soft hover:shadow-raised">
          <div className="flex items-start gap-4">
            <span className="grid size-10 shrink-0 place-items-center rounded-control bg-brand text-h3 font-black text-on-brand">{d.n}</span>
            <div>
              <h4 className="text-h2 font-bold">{d.title}</h4>
              <p className="text-body text-ink-2">{d.desc}</p>
            </div>
          </div>
          <dl className="grid gap-2 rounded-control bg-sunken p-3 text-caption">
            <div className="flex gap-3"><dt className="w-10 shrink-0 text-ink-3">依据</dt><dd className="flex items-center gap-1 font-medium"><Link2 className="size-3 text-ink-3" />{d.proof}</dd></div>
            <div className="flex gap-3"><dt className="w-10 shrink-0 text-ink-3">做法</dt><dd className="font-medium">{d.how}</dd></div>
          </dl>
          <button onClick={() => go(d.to)} className="mt-auto inline-flex w-fit items-center gap-1.5 text-body font-semibold text-brand">
            {d.cta}<ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </button>
        </motion.article>
      ))}
    </div>
  )
}

export function Report({ go }: { go: (p: Page) => void }) {
  const [tab, setTab] = useState<TabKey>('overview')
  const [sel, setSel] = useState<Sel>([0, 0])
  const [focusQ, setFocusQ] = useState<number | null>(null)
  const [gate, setGate] = useState(false)
  const openQuestion = (q: number) => {
    const p = SAMPLES.findIndex((r) => r[q].rank != null)
    setFocusQ(q)
    setSel([Math.max(p, 0), q])
    setTab('platform')
  }

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="grid gap-6 px-5 pb-12 pt-6 md:px-10">
      <motion.header variants={rise} className="grid gap-5">
        <div className="flex items-center justify-between gap-4">
          <button onClick={() => go('home')} className="flex items-center gap-1.5 text-caption text-ink-2 hover:text-ink"><ArrowLeft className="size-3.5" />返回品牌服务</button>
          <div className="relative">
            <button onClick={() => setGate((g) => !g)} aria-expanded={gate} className="flex items-center gap-1.5 rounded-full border border-line px-4 py-2 text-caption text-ink-2 hover:bg-sunken">
              <Lock className="size-3.5" />重新诊断
            </button>
            <AnimatePresence>
              {gate && (
                <motion.div role="status" initial={{ opacity: 0, y: -6, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}
                  className="absolute right-0 top-12 z-20 w-72 rounded-panel border border-line bg-surface p-4 text-caption shadow-raised">
                  <p className="font-semibold text-ink">同一版品牌资料只诊断一次</p>
                  <p className="mt-1 text-ink-2">更新品牌资料后即可重新诊断，两次结果才能对比。</p>
                  <button className="mt-3 font-semibold text-brand">去更新品牌资料 →</button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        <div>
          <h1 className="text-[clamp(2rem,4vw,2.75rem)] font-black leading-tight tracking-tight">诊断报告</h1>
          <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-body text-ink-2">
            <FileSearch className="size-4 text-brand" />
            <span>AI 搜索诊断</span><span aria-hidden className="text-ink-3">·</span>
            <span>9月26日完成</span><span aria-hidden className="text-ink-3">·</span>
            <span>5 个平台 × 4 个问题</span>
          </p>
        </div>
      </motion.header>

      <Hero />

      <motion.nav variants={rise} className="flex gap-1 border-b border-line" aria-label="报告内容">
        {TABS.map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} aria-current={tab === k ? 'page' : undefined}
            className={cx('relative px-4 py-3 text-body transition-colors', tab === k ? 'font-semibold text-ink' : 'text-ink-2 hover:text-ink')}>
            {l}
            {tab === k && <motion.span layoutId="report-tab" transition={SPRING} className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-brand" />}
          </button>
        ))}
      </motion.nav>

      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25, ease: EASE }}>
          {tab === 'overview' && (
            <div className="grid gap-6">
              <QuestionRows open={openQuestion} />
              <div className="grid gap-4 md:grid-cols-2">
                {GLANCE.map((g) => (
                  <button key={g.title} onClick={() => setTab(g.tab)} className="group grid gap-3 rounded-panel border border-line bg-surface p-6 text-left shadow-soft transition-shadow hover:shadow-raised">
                    <span className="flex items-center justify-between">
                      <span><b className="block text-h2">{g.title}</b><span className="text-caption text-ink-2">{g.desc}</span></span>
                      <ArrowRight className="size-4 text-ink-3 transition-transform group-hover:translate-x-1" />
                    </span>
                    <span className="flex flex-wrap gap-2">
                      {g.chips.map(([t, k]) => <span key={t} className={cx('rounded-full px-3 py-1 text-caption font-semibold', CHIP[k])}>{t}</span>)}
                    </span>
                  </button>
                ))}
              </div>
              <div className="grid gap-3">
                <div>
                  <h3 className="text-h2 font-bold">优化方向</h3>
                  <p className="text-caption text-ink-2">依据 20 条回答，先做这两件事</p>
                </div>
                <Directions go={go} />
              </div>
            </div>
          )}
          {tab === 'platform' && <PositionMap sel={sel} setSel={setSel} focusQ={focusQ} setFocusQ={setFocusQ} />}
          {tab === 'impression' && <Impression />}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
}
