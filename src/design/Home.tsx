import { useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowRight, Check, ChevronDown, ExternalLink, FileText, Sparkles } from 'lucide-react'
import { PlaneArt, SheetsArt } from './art'
import { LogoField, SearchArt } from './brand'
import { CountUp, EASE, Parallax, rise, SPRING, stagger, useTilt } from './motion'
import { PLATFORM_NAMES, TIER, bestRank, tierOf } from './diag'
import { ARTICLE, ORDERS, Progress, Stars, cx } from './shared'

type Tone = 'brand' | 'orange' | 'mint'
const TONE: Record<Tone, { field: string; btn: string; ring: string; chip: string }> = {
  brand: { field: 'from-brand-soft via-surface to-surface', btn: 'bg-brand text-on-brand shadow-brand/30', ring: 'focus-visible:outline-brand', chip: 'bg-brand-soft text-brand' },
  orange: { field: 'from-orange-soft via-surface to-surface', btn: 'bg-orange text-orange-ink shadow-orange/30', ring: 'focus-visible:outline-orange', chip: 'bg-orange-soft text-orange-ink' },
  mint: { field: 'from-mint-soft via-surface to-surface', btn: 'bg-mint text-on-brand shadow-mint/30', ring: 'focus-visible:outline-mint', chip: 'bg-mint-soft text-mint' },
}

/** 服务卡：色场 + 讲内容的图形 + 主指标；悬停/聚焦展开“这项服务此刻的具体情况” */
function ServiceCard({ tone, title, desc, art: Art, label, metric, cta, peek, badge, step, onCta }: {
  tone: Tone; step: string; title: string; desc: string; art: typeof SearchArt; label: string; metric: ReactNode; cta: string; peek: ReactNode; badge?: string; onCta?: () => void
}) {
  const [on, setOn] = useState(false)
  const t = useTilt(4)
  const s = TONE[tone]
  return (
    <motion.article
      variants={rise}
      onHoverStart={() => setOn(true)}
      onHoverEnd={() => setOn(false)}
      onFocus={() => setOn(true)}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setOn(false)}
      {...t.handlers}
      style={{ rotateX: t.rotateX, rotateY: t.rotateY, transformPerspective: 900 }}
      className={cx('group relative isolate flex min-h-[340px] flex-col overflow-hidden rounded-panel border border-line/80 bg-linear-to-br p-6 shadow-soft transition-shadow duration-300 hover:shadow-raised', s.field)}
    >
      <Parallax x={t.sx} y={t.sy} depth={10} className="pointer-events-none absolute right-2 top-4 -z-10 w-36 xl:w-40">
        <Art active={on} className="w-full" />
      </Parallax>
      <div className="mb-3 flex h-7 items-center">
        {badge ? (
          <span className={cx('inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-eyebrow font-semibold', s.chip)}>
            <Sparkles className="size-3" /> {badge}
          </span>
        ) : <span className="text-caption text-ink-3">{step}</span>}
      </div>
      <h2 className="max-w-[60%] text-h1 font-black tracking-tight">{title}</h2>
      <p className="mt-2 max-w-[58%] text-caption leading-relaxed text-ink-2">{desc}</p>

      <div className="mt-auto pt-8">
        <p className="text-caption text-ink-2">{label}</p>
        <div className="mt-1 flex items-baseline gap-1.5">{metric}</div>
        <motion.div
          initial={false}
          animate={{ height: on ? 'auto' : 0, opacity: on ? 1 : 0 }}
          transition={{ duration: 0.35, ease: EASE }}
          className="overflow-hidden"
        >
          <div className="pt-4">{peek}</div>
        </motion.div>
        <motion.button
          onClick={onCta}
          whileTap={{ scale: 0.97 }}
          className={cx('mt-5 inline-flex h-11 items-center gap-2 rounded-full px-6 text-body font-semibold shadow-lg outline-offset-2 focus-visible:outline-2', s.btn, s.ring)}
        >
          {cta}
          <motion.span animate={{ x: on ? 4 : 0 }} transition={SPRING}><ArrowRight className="size-4" /></motion.span>
        </motion.button>
      </div>
    </motion.article>
  )
}

/** 诊断卡的展开内容：5 个平台各自把你排第几 */
function PlatformPeek() {
  return (
    <ul className="flex flex-wrap gap-1.5" aria-label="各平台排位">
      {PLATFORM_NAMES.map((n, i) => {
        const r = bestRank(i)
        return (
          <motion.li key={n} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
            className={cx('flex items-center gap-1 rounded-full px-2 py-0.5 text-eyebrow', r ? TIER[tierOf(r)].chip : 'border border-dashed border-mark text-ink-3')}>
            {n} · {r ? `第 ${r} 位` : '未提及'}
          </motion.li>
        )
      })}
    </ul>
  )
}

/** 内容卡：文章状态机 草稿 → 确认 → 可发布 */
function ArticlePeek() {
  const steps = ['生成草稿', '确认内容', '可用于发布']
  return (
    <div className="grid gap-2.5">
      <p className="truncate text-body font-semibold">《{ARTICLE.title}》</p>
      <ol className="flex items-center gap-1.5 text-eyebrow text-ink-2">
        {steps.map((s, i) => (
          <li key={s} className="flex items-center gap-1.5">
            <span className="grid size-4 place-items-center rounded-full bg-orange text-orange-ink"><Check className="size-2.5" strokeWidth={3} /></span>
            {s}
            {i < steps.length - 1 && <span className="h-px w-3 bg-orange/40" />}
          </li>
        ))}
      </ol>
    </div>
  )
}

/** 发布卡：两种发布方式的差异一句话讲清 */
function PublishPeek() {
  const [m, setM] = useState<'pack' | 'precise'>('pack')
  const copy = { pack: '按篇数购买，我们来选媒体', precise: '自己挑媒体，按媒体计价' }
  return (
    <div className="grid gap-2">
      <div className="relative inline-grid w-fit grid-cols-2 rounded-full bg-surface/80 p-0.5 text-caption ring-1 ring-line">
        {(['pack', 'precise'] as const).map((v) => (
          <button key={v} onClick={() => setM(v)} aria-pressed={m === v} className={cx('relative z-10 rounded-full px-3 py-1 transition-colors', m === v ? 'text-on-brand' : 'text-ink-2')}>
            {m === v && <motion.span layoutId="pub-mode" transition={SPRING} className="absolute inset-0 -z-10 rounded-full bg-mint" />}
            {v === 'pack' ? '套餐发布' : '精准发布'}
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.p key={m} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.2 }} className="text-caption text-ink-2">
          {copy[m]}
        </motion.p>
      </AnimatePresence>
    </div>
  )
}

/** 发布记录：一行一笔订单，展开即看到已上线的链接 */
function OrderRow({ o, open, toggle }: { o: (typeof ORDERS)[number]; open: boolean; toggle: () => void }) {
  return (
    <li className="border-b border-line last:border-0">
      <button onClick={toggle} aria-expanded={open}
        className="grid w-full grid-cols-[auto_1fr_auto] items-center gap-4 rounded-control px-2 py-4 text-left transition-colors hover:bg-sunken/60 md:grid-cols-[auto_1.2fr_0.7fr_1.6fr_0.6fr_auto]">
        <span className={cx('grid size-9 place-items-center rounded-control', o.tone === 'brand' ? 'bg-brand-soft text-brand' : 'bg-mint-soft text-mint')}><FileText className="size-4" /></span>
        <span><b className="font-semibold">{o.name}</b><small className="block text-caption text-ink-3">{o.plan}</small></span>
        <span className={cx('hidden items-center gap-1.5 text-caption md:flex', o.tone === 'brand' ? 'text-brand' : 'text-mint')}>
          {o.tone === 'brand' ? (
            <span className="relative flex size-2"><span className="absolute inset-0 animate-ping rounded-full bg-brand/50" /><span className="relative size-2 rounded-full bg-brand" /></span>
          ) : <Check className="size-3.5" strokeWidth={3} />}
          {o.status}
        </span>
        <span className="hidden items-center gap-3 md:flex"><Progress {...o} /><span className="shrink-0 text-caption text-ink-2 tabular-nums">{o.done} / {o.total} 篇</span></span>
        <span className="hidden text-caption text-ink-3 md:block">{o.date}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={SPRING} className="text-ink-3"><ChevronDown className="size-4" /></motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35, ease: EASE }} className="overflow-hidden">
            <ol className="relative mb-4 ml-6 grid gap-3 border-l border-dashed border-line pl-6 md:ml-[3.25rem]">
              {o.results.map((r, i) => (
                <motion.li key={r.media} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.08 * i }} className="relative flex flex-wrap items-center gap-x-4 gap-y-1 text-body">
                  <span className={cx('absolute -left-[1.85rem] size-2.5 rounded-full ring-4 ring-surface', o.tone === 'brand' ? 'bg-brand' : 'bg-mint')} />
                  <span className="font-medium">{r.media}</span>
                  <span className="text-caption text-ink-3">{r.time} 上线</span>
                  <a href="#" onClick={(e) => e.preventDefault()} className="ml-auto flex items-center gap-1 text-caption text-brand hover:underline">查看原文 <ExternalLink className="size-3" /></a>
                </motion.li>
              ))}
              {o.done < o.total && (
                <li className="relative text-caption text-ink-3">
                  <span className="absolute -left-[1.85rem] top-1 size-2.5 rounded-full border-2 border-mark bg-surface" />
                  还有 {o.total - o.done} 篇处理中，上线后会通知你
                </li>
              )}
            </ol>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  )
}

export function Home({ go }: { go: (p: 'report') => void }) {
  const [open, setOpen] = useState<string | null>(null)
  return (
    <div className="relative overflow-hidden">
      <LogoField className="inset-x-0 top-0 h-[460px]" />
      <motion.div variants={stagger} initial="hidden" animate="show" className="relative grid gap-8 px-5 pb-10 pt-12 md:px-10">
        <motion.header variants={rise} className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <h1 className="text-[clamp(2.4rem,5.2vw,3.75rem)] font-black leading-[1.05] tracking-tight">品牌服务</h1>
            <p className="mt-3 text-body text-ink-2">让更多人在 AI 搜索里找到你</p>
          </div>
        </motion.header>

        <motion.div variants={stagger} className="grid gap-4 lg:grid-cols-3">
          <ServiceCard tone="brand" title="AI 搜索诊断" step="第 1 步" desc="看 AI 怎么介绍你的品牌" art={SearchArt} onCta={() => go('report')}
            label="AI 推荐指数"
            metric={<><CountUp to={3.5} decimals={1} className="text-display font-black leading-none text-brand tabular-nums" /><span className="text-h3 text-ink-2">/ 5</span><Stars value={3.5} className="ml-2" /></>}
            peek={<PlatformPeek />} cta="查看报告" />
          <ServiceCard tone="orange" title="品牌内容" step="第 2 步" desc="写好并确认品牌核心文章" art={SheetsArt}
            label="核心文章"
            metric={<><CountUp to={1} className="text-display font-black leading-none tabular-nums" /><span className="text-h3 text-ink-2">篇 · 已确认</span></>}
            peek={<ArticlePeek />} cta="查看文章" />
          <ServiceCard tone="mint" title="媒体发布" step="第 3 步" desc="把文章发布到 50+ 家媒体" art={PlaneArt}
            label="可选媒体资源" badge="建议下一步"
            metric={<><CountUp to={50} className="text-display font-black leading-none tabular-nums" /><span className="text-display font-black leading-none">+</span><span className="text-h3 text-ink-2">家</span></>}
            peek={<PublishPeek />} cta="选择发布方式" />
        </motion.div>

        <motion.section variants={rise} className="rounded-panel border border-line/80 bg-surface p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <h2 className="text-h2 font-bold">发布记录</h2>
            <button className="group flex items-center gap-1 text-caption text-ink-2 hover:text-ink">
              查看全部 <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
          <ul className="mt-2">
            {ORDERS.map((o) => <OrderRow key={o.id} o={o} open={open === o.id} toggle={() => setOpen(open === o.id ? null : o.id)} />)}
          </ul>
        </motion.section>
      </motion.div>
    </div>
  )
}
