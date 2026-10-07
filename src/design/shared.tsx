import { useEffect, useRef } from 'react'
import { animate, motion, useMotionValue, useReducedMotion } from 'motion/react'
import { Bell, ChevronDown, FileText, Star } from 'lucide-react'
import { EASE } from './motion'
import { LogoMark } from './brand'

export const cx = (...c: (string | false | undefined | null)[]) => c.filter(Boolean).join(' ')

/* ── 示例数据（与线框一致的业务口径） ── */
export { BRAND } from './diag'
import { BRAND } from './diag'
export const ARTICLE = { title: '青禾家政：把每一次上门服务讲清楚', confirmedAt: '9月28日 14:20' }
export const ORDERS = [
  {
    id: 'PO-0924', name: '品牌介绍', plan: '多点分布 · 10 篇', status: '发布中', done: 2, total: 10, date: '9月24日', tone: 'brand' as const,
    results: [
      { media: '上海热线 · 生活频道', time: '9月25日 10:12' },
      { media: '新浪家居', time: '9月25日 16:40' },
    ],
  },
  {
    id: 'PO-0920', name: '服务介绍', plan: '基础覆盖 · 10 篇', status: '已完成', done: 10, total: 10, date: '9月20日', tone: 'mint' as const,
    results: [
      { media: '澎湃生活', time: '9月21日 09:30' },
      { media: '家政之家', time: '9月21日 11:05' },
      { media: '人民网 · 上海', time: '9月22日 14:18' },
    ],
  },
]

export type Page = 'home' | 'report' | 'running' | 'points'

/* ── 顶栏 ── */
export function TopBar({ page, go, balance }: { page: Page; go: (p: Page) => void; balance: number }) {
  return (
    <header className="relative z-10 flex items-center gap-4 border-b border-line/70 bg-surface/80 px-5 py-3 backdrop-blur-md md:px-8">
      <button onClick={() => go('home')} className="flex items-center gap-2 text-h3 font-bold tracking-tight text-brand">
        <LogoMark className="size-7" />
        洞点
      </button>
      <span className="h-5 w-px bg-line" />
      <button className="flex items-center gap-1 rounded-control px-2 py-1 text-body transition-colors hover:bg-sunken">
        {BRAND} <ChevronDown className="size-4 text-ink-3" />
      </button>
      <nav className="ml-auto flex items-center gap-1 text-caption">
        <button className="relative grid size-9 place-items-center rounded-control transition-colors hover:bg-sunken" aria-label="通知，2 条未读">
          <Bell className="size-4" />
          <span className="absolute right-2 top-2 size-2 rounded-full border-2 border-surface bg-orange" />
        </button>
        <button className="hidden items-center gap-1.5 rounded-control px-2.5 py-2 transition-colors hover:bg-sunken sm:flex">
          <FileText className="size-4" /> 品牌资料
        </button>
        <button
          onClick={() => go('points')}
          aria-current={page === 'points' ? 'page' : undefined}
          className={cx('flex items-center gap-1.5 rounded-full border px-3 py-1.5 transition-colors', page === 'points' ? 'border-brand/30 bg-brand-soft text-brand' : 'border-line hover:bg-sunken')}
        >
          <span className="text-orange">⚡</span><AnimatedNumber value={balance} className="font-semibold tabular-nums" />
        </button>
      </nav>
    </header>
  )
}

/** 在两个值之间补间，用于余额、金额等会变化的数字 */
export function AnimatedNumber({ value, className, prefix = '' }: { value: number; className?: string; prefix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const mv = useMotionValue(value)
  const reduce = useReducedMotion()
  useEffect(() => {
    if (reduce) { mv.set(value); return }
    const c = animate(mv, value, { duration: 0.6, ease: EASE })
    return () => c.stop()
  }, [value, reduce, mv])
  useEffect(() => mv.on('change', (v) => { if (ref.current) ref.current.textContent = prefix + Math.round(v).toLocaleString('zh-CN') }), [mv, prefix])
  return <span ref={ref} className={className}>{prefix + value.toLocaleString('zh-CN')}</span>
}

/** 星级：逐颗点亮，半星按宽度裁切 */
export function Stars({ value, className }: { value: number; className?: string }) {
  return (
    <span className={cx('inline-flex gap-0.5', className)} role="img" aria-label={`${value} 星，满分 5 星`}>
      {[0, 1, 2, 3, 4].map((i) => {
        const f = Math.max(0, Math.min(1, value - i))
        return (
          <span key={i} className="relative size-4">
            <Star className="absolute inset-0 size-4 text-mark" fill="currentColor" strokeWidth={0} />
            <motion.span
              className="absolute inset-y-0 left-0 overflow-hidden"
              initial={{ width: 0 }}
              whileInView={{ width: `${f * 100}%` }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 + i * 0.12, duration: 0.35, ease: EASE }}
            >
              <Star className="size-4 text-orange" fill="currentColor" strokeWidth={0} />
            </motion.span>
          </span>
        )
      })}
    </span>
  )
}

export function Progress({ done, total, tone }: { done: number; total: number; tone: 'brand' | 'mint' }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-sunken" role="progressbar" aria-valuenow={done} aria-valuemin={0} aria-valuemax={total}>
      <motion.div
        className={cx('h-full w-full origin-left rounded-full', tone === 'brand' ? 'bg-linear-to-r from-brand/70 to-brand' : 'bg-linear-to-r from-mint/70 to-mint')}
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: done / total }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: EASE, delay: 0.2 }}
      />
    </div>
  )
}
