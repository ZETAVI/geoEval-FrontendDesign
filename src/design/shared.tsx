import { useEffect, useRef } from 'react'
import { animate, motion, useMotionValue, useReducedMotion } from 'motion/react'
import { Star } from 'lucide-react'
import { EASE } from './motion'

export const cx = (...c: (string | false | undefined | null)[]) => c.filter(Boolean).join(' ')

/* ── 示例数据（与线框一致的业务口径） ── */
export { BRAND } from './diag'
export const ARTICLE = { title: '青禾家政：把每一次上门服务讲清楚', confirmedAt: '9月28日 14:20' }

export type Page = 'home' | 'report' | 'running' | 'points' | 'content' | 'publish' | 'order' | 'help'

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
