import { useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowRight, Check, Sparkles } from 'lucide-react'
import { PlaneArt, SheetsArt } from './art'
import { LogoField, SearchArt } from './brand'
import { CountUp, EASE, Parallax, rise, SPRING, stagger, useTilt } from './motion'
import { PLATFORM_NAMES, TIER, bestRank, tierOf } from './diag'
import { Stars, cx } from './shared'
import { OrderRow } from './Orders'
import { MEDIA } from './media'
import { useFlow, type Article, type BrandState } from './flow'
import { METRICS } from './diag'

type Tone = 'brand' | 'orange' | 'mint'
const TONE: Record<Tone, { field: string; btn: string; ring: string; chip: string; num: string }> = {
  brand: { field: 'from-brand-soft via-surface to-surface', btn: 'bg-brand text-on-brand shadow-brand/30', ring: 'focus-visible:outline-brand', chip: 'bg-brand-soft text-brand', num: 'text-brand' },
  orange: { field: 'from-orange-soft via-surface to-surface', btn: 'bg-orange text-orange-ink shadow-orange/30', ring: 'focus-visible:outline-orange', chip: 'bg-orange-soft text-orange-ink', num: 'text-orange-deep' },
  mint: { field: 'from-mint-soft via-surface to-surface', btn: 'bg-mint text-on-brand shadow-mint/30', ring: 'focus-visible:outline-mint', chip: 'bg-mint-soft text-mint', num: 'text-mint' },
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
        ) : <span className={cx("text-caption font-semibold", s.num)}>{step}</span>}
      </div>
      <h2 className="max-w-[60%] text-h1 font-black tracking-tight">{title}</h2>
      <p className="mt-2 max-w-[58%] text-caption leading-relaxed text-ink-2">{desc}</p>

      <div className="mt-auto pt-8">
        <p className="text-caption text-ink-2">{label}</p>
        <div className={cx("mt-1 flex items-baseline gap-1.5", s.num)}>{metric}</div>
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
function ArticlePeek({ article }: { article: Article | null }) {
  const steps = ['写草稿', '确认', '可发布']
  const done = !article ? 0 : article.status === 'draft' ? 1 : 3
  return (
    <div className="grid gap-2.5">
      <p className="truncate text-body font-semibold">{article ? `《${article.title}》` : '还没有文章，按诊断报告的建议来写'}</p>
      <ol className="flex items-center gap-1.5 text-eyebrow text-ink-2">
        {steps.map((s, i) => (
          <li key={s} className="flex items-center gap-1.5">
            <span className={cx('grid size-4 place-items-center rounded-full', i < done ? 'bg-orange text-orange-ink' : 'border border-dashed border-mark')}>{i < done && <Check className="size-2.5" strokeWidth={3} />}</span>
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
  const copy = { pack: '买一档篇数，由我们安排媒体', precise: '自己挑每一家媒体，逐家计价' }
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

const NEXT: Record<BrandState, 'diag' | 'content' | 'publish' | null> = { setup: 'diag', ready: 'diag', report: 'content', draft: 'content', publishable: 'publish', published: null }

export function Home() {
  const { go, state, article, orders } = useFlow()
  const next = NEXT[state]
  const diagnosed = state !== 'ready' && state !== 'setup'
  const setup = state === 'setup'
  const contentCta = state === 'report' ? '写第一篇文章' : state === 'draft' ? '确认文章' : state === 'ready' ? '写文章' : '查看文章'
  const publishCta = state === 'publishable' ? '去发布这篇' : state === 'published' ? '再发布一批' : '看看发布方式'
  return (
    <div className="relative overflow-hidden">
      <LogoField className="inset-x-0 top-0 h-[460px]" />
      <motion.div variants={stagger} initial="hidden" animate="show" className="relative grid gap-8 px-5 pb-10 pt-12 md:px-10">
        <motion.header variants={rise} className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <h1 className="text-[clamp(2.4rem,5.2vw,3.75rem)] font-black leading-[1.05] tracking-tight">品牌服务</h1>
            <p className="mt-3 text-body text-ink-2">先看 AI 怎么说你，再写文章，最后发到媒体上</p>
          </div>
        </motion.header>

        <motion.div variants={stagger} className="grid gap-4 lg:grid-cols-3">
          <ServiceCard tone="brand" title="AI 搜索诊断" step="第 1 步" desc="看 5 个 AI 平台把你排第几" art={SearchArt}
            badge={next === 'diag' ? '建议下一步' : undefined} onCta={() => (setup ? go('content', { tab: 'profile' }) : go(diagnosed ? 'report' : 'running'))}
            label="AI 推荐指数"
            metric={diagnosed
              ? <><CountUp to={METRICS.index} decimals={1} className="text-display font-black leading-none tabular-nums" /><span className="text-h3 text-ink-2">/ 5</span><Stars value={METRICS.index} className="ml-2" /></>
              : <span className="text-h1 font-black leading-none text-ink-3">尚未诊断</span>}
            peek={diagnosed ? <PlatformPeek /> : <p className="text-caption text-ink-2">{setup ? '品牌资料还没填完，补全后才能诊断。' : '约 3 分钟，每个平台问 4 个问题。'}</p>} cta={diagnosed ? '查看报告' : setup ? '先补全资料' : '开始诊断'} />
          <ServiceCard tone="orange" title="品牌内容" step="第 2 步" desc="写一篇 AI 愿意引用的文章" art={SheetsArt}
            badge={next === 'content' ? '建议下一步' : undefined} onCta={() => go('content', { tab: 'article' })}
            label="当前文章"
            metric={<><CountUp to={article ? 1 : 0} className="text-display font-black leading-none tabular-nums" /><span className="text-h3 text-ink-2">篇 · {!article ? '还没开始写' : article.status === 'draft' ? '草稿，待确认' : '已确认，可发布'}</span></>}
            peek={<ArticlePeek article={article} />} cta={contentCta} />
          <ServiceCard tone="mint" title="媒体发布" step="第 3 步" desc="把文章发到媒体，让 AI 找到你" art={PlaneArt}
            label="可选媒体" badge={next === 'publish' ? '建议下一步' : undefined} onCta={() => go('publish', { tab: 'plans' })}
            metric={<><CountUp to={MEDIA.length} className="text-display font-black leading-none tabular-nums" /><span className="text-h3 text-ink-2">家</span></>}
            peek={<PublishPeek />} cta={publishCta} />
        </motion.div>

        <motion.section variants={rise} className="rounded-panel border border-line/80 bg-surface p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <h2 className="text-h2 font-bold">发布记录</h2>
            {orders.length > 0 && <button onClick={() => go('publish', { tab: 'orders' })} className="flex items-center gap-1 text-caption font-semibold text-mint">查看全部 {orders.length} 笔<ArrowRight className="size-3.5" /></button>}
          </div>
          {orders.length ? (
            <>
              <ul className="mt-2">
                {orders.slice(0, 2).map((o) => <OrderRow key={o.id} o={o} />)}
              </ul>
              <div className="mt-2 flex flex-wrap items-center gap-3 rounded-control bg-brand-soft px-4 py-3 text-body">
                <span className="text-ink-2">文章上线后，AI 的回答会逐步变化，可以再测一次看效果。</span>
                <button onClick={() => go('running')} className="ml-auto flex items-center gap-1.5 font-semibold text-brand">再测一次 <ArrowRight className="size-4" /></button>
              </div>
            </>
          ) : (
            <p className="py-10 text-center text-caption text-ink-3">还没有发布记录。文章发出后，每家媒体的上线进度会在这里。</p>
          )}
        </motion.section>
      </motion.div>
    </div>
  )
}
