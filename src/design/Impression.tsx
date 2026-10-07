import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Quote, ThumbsDown, ThumbsUp } from 'lucide-react'
import { BRAND } from './diag'
import { EASE, SPRING } from './motion'
import { cx } from './shared'

type Theme = { t: string; n: number; tone: 'pos' | 'neg'; quotes: { who: string; text: string }[] }
/** 按“云”的视觉顺序排列：大小交错，正负交错 */
const THEMES: Theme[] = [
  { t: '上门流程规范', n: 4, tone: 'pos', quotes: [{ who: '豆包 · Q1', text: '上门流程规范，服务前会确认清单，适合浦东家庭。' }, { who: '豆包 · Q3', text: '本地家政公司，流程规范。' }] },
  { t: '服务范围不清楚', n: 3, tone: 'neg', quotes: [{ who: '豆包 · Q3', text: '服务范围没有写清。' }, { who: 'Kimi · Q3', text: '但服务区域不明确。' }] },
  { t: '阿姨培训到位', n: 3, tone: 'pos', quotes: [{ who: 'Kimi · Q3', text: '阿姨培训到位。' }, { who: '豆包 · Q2', text: '深度保洁有固定清单，阿姨上岗前有培训。' }] },
  { t: '线上评价较少', n: 2, tone: 'neg', quotes: [{ who: 'DeepSeek · Q3', text: '线上评价较少。' }, { who: 'DeepSeek · Q1', text: '公开信息较少。' }] },
  { t: '价格透明', n: 2, tone: 'pos', quotes: [{ who: '豆包 · Q2', text: '深度保洁有固定清单，报价按面积计。' }] },
]
const SIZE = { 4: 'px-6 py-3.5 text-h1 font-black', 3: 'px-5 py-3 text-h2 font-bold', 2: 'px-4 py-2 text-h3 font-semibold' } as const
const TONE = {
  pos: { chip: 'bg-mint-soft text-mint', on: 'ring-2 ring-mint', mark: 'text-mint decoration-mint', tag: 'bg-mint text-on-brand' },
  neg: { chip: 'bg-danger-soft text-danger', on: 'ring-2 ring-danger', mark: 'text-danger decoration-danger', tag: 'bg-danger text-on-brand' },
}
const POS = THEMES.filter((x) => x.tone === 'pos').length
const NEG = THEMES.length - POS

/** AI 对你的一句话画像：关键词直接嵌在句子里 */
function Portrait() {
  const m = (t: string, tone: 'pos' | 'neg') => <mark className={cx('bg-transparent underline decoration-2 underline-offset-[6px]', TONE[tone].mark)}>{t}</mark>
  return (
    <section className="relative overflow-hidden rounded-panel border border-line bg-linear-to-br from-brand-soft via-surface to-surface p-6 shadow-soft md:p-10">
      <div className="grid items-center gap-8 md:grid-cols-[1fr_auto]">
        <div className="border-l-4 border-brand pl-5 md:pl-7">
          <p className="mb-3 flex items-center gap-2 text-caption text-ink-2">
            <span className="rounded-full bg-brand-soft px-2 py-0.5 text-eyebrow font-semibold text-brand">AI 生成</span>
            综合 6 条提到你的回答
          </p>
          <p className="text-[clamp(1.5rem,2.8vw,2.25rem)] font-black leading-snug tracking-tight">
            在 AI 眼里，{BRAND}是一家{m('上门流程规范', 'pos')}、{m('阿姨培训到位', 'pos')}的本地家政公司，但{m('服务范围', 'neg')}和{m('线上口碑', 'neg')}还不够清楚。
          </p>
        </div>
        <dl className="flex gap-3 md:flex-col">
          {([['优点', POS, 'bg-mint-soft text-mint', ThumbsUp], ['短板', NEG, 'bg-danger-soft text-danger', ThumbsDown]] as const).map(([l, v, c, Icon]) => (
            <div key={l} className={cx('flex min-w-32 items-center gap-3 rounded-control px-4 py-3', c)}>
              <Icon className="size-5" />
              <dd className="text-display font-black leading-none tabular-nums">{v}</dd>
              <dt className="text-caption">个{l}</dt>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}

/** 关键词云：字越大，被 AI 重复提到越多；点开看原句 */
function Cloud() {
  const [sel, setSel] = useState(0)
  const th = THEMES[sel]
  return (
    <section className="flex flex-col rounded-panel border border-line bg-surface p-6 shadow-soft">
      <h3 className="text-h2 font-bold">印象关键词</h3>
      <p className="text-caption text-ink-2">字越大，AI 提到越多次</p>
      <div className="my-6 flex flex-wrap items-center justify-center gap-3">
        {THEMES.map((x, i) => (
          <motion.button
            key={x.t}
            initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 + i * 0.08, ...SPRING }}
            whileHover={{ y: -3 }} whileTap={{ scale: 0.96 }}
            onClick={() => setSel(i)} aria-pressed={sel === i}
            className={cx('relative rounded-full outline-offset-2 focus-visible:outline-2 focus-visible:outline-brand', SIZE[x.n as 2 | 3 | 4], TONE[x.tone].chip, sel === i && TONE[x.tone].on)}
          >
            {x.t}
            <sup className="ml-1 text-eyebrow font-semibold tabular-nums opacity-80">{x.n}</sup>
          </motion.button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={th.t} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.22, ease: EASE }}
          className="mt-auto grid gap-2 rounded-control bg-sunken p-4" aria-live="polite">
          <p className="flex items-center gap-2 text-caption text-ink-2">
            <span className={cx('rounded-full px-2 py-0.5 text-eyebrow font-semibold', TONE[th.tone].tag)}>{th.tone === 'pos' ? '优点' : '短板'}</span>
            <b className="text-ink">{th.t}</b>· 来自 {th.n} 条回答
          </p>
          {th.quotes.map((q) => (
            <p key={q.who + q.text} className="flex gap-2 text-body">
              <Quote className="mt-1 size-3.5 shrink-0 text-ink-3" />
              <span>“{q.text}”<small className="ml-2 text-caption text-ink-3">{q.who}</small></span>
            </p>
          ))}
        </motion.div>
      </AnimatePresence>
    </section>
  )
}

/* 同场品牌：圆的面积 = 出现次数 */
const PEERS = [
  { name: '阿姨帮', n: 14, x: 150, y: 140 },
  { name: '管家帮', n: 11, x: 300, y: 110 },
  { name: '天鹅到家', n: 9, x: 255, y: 225 },
  { name: BRAND, n: 6, x: 395, y: 205, me: true },
  { name: '好慷在家', n: 4, x: 440, y: 95 },
]
const R = (n: number) => 16.5 * Math.sqrt(n)

function Peers() {
  const top = PEERS[0]
  const me = PEERS.find((p) => p.me)!
  return (
    <section className="flex flex-col rounded-panel border border-line bg-surface p-6 shadow-soft">
      <h3 className="text-h2 font-bold">同场品牌</h3>
      <p className="text-caption text-ink-2">20 条回答里，一起出现的品牌</p>
      <svg viewBox="0 0 520 300" className="mt-3 w-full" role="img" aria-label={PEERS.map((p) => `${p.name} ${p.n} 次`).join('，')}>
        {PEERS.map((p, i) => (
          <motion.g key={p.name} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} whileHover={{ scale: 1.05 }}
            transition={{ delay: 0.1 + i * 0.1, type: 'spring', stiffness: 220, damping: 18 }} className="origin-center [transform-box:fill-box]">
            <circle cx={p.x} cy={p.y} r={R(p.n)} className={p.me ? 'fill-brand' : 'fill-sunken stroke-line'} strokeWidth={1.5} />
            <text x={p.x} y={p.y - 2} textAnchor="middle" className={cx('font-sans text-h3 font-bold', p.me ? 'fill-on-brand' : 'fill-ink')}>{p.name}</text>
            <text x={p.x} y={p.y + 16} textAnchor="middle" className={cx('font-sans text-caption tabular-nums', p.me ? 'fill-on-brand' : 'fill-ink-2')}>{p.n} 次{p.me ? ' · 你' : ''}</text>
          </motion.g>
        ))}
      </svg>
      <p className="mt-auto text-caption text-ink-2">圆越大，出现越多。{top.name}出现在 {top.n} 条回答里，你出现在 {me.n} 条。</p>
    </section>
  )
}

export function Impression() {
  return (
    <div className="grid gap-4">
      <Portrait />
      <div className="grid gap-4 lg:grid-cols-2">
        <Cloud />
        <Peers />
      </div>
    </div>
  )
}
