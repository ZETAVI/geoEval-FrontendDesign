import { motion, useReducedMotion } from 'motion/react'
import { EASE } from './motion'
import { cx } from './shared'

/* 构成图形：SVG + token 渐变。每个图形都讲述对应服务的内容，而不只是装饰。 */

/** 内容 · 叠放文稿：顶页的文字行在进入时被“写出”，悬停时纸张展开 */
export function SheetsArt({ active, className }: { active?: boolean; className?: string }) {
  const reduce = useReducedMotion()
  const fan = active && !reduce
  const lines = [[40, 150], [40, 128], [40, 140]]
  return (
    <svg viewBox="0 0 220 220" className={cx('overflow-visible', className)} aria-hidden>
      <defs>
        <linearGradient id="sheet-back" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" className="[stop-color:var(--s-orange-soft)]" />
          <stop offset="1" className="[stop-color:var(--s-orange)] [stop-opacity:.55]" />
        </linearGradient>
        <linearGradient id="sheet-front" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" className="[stop-color:var(--s-bg)]" />
          <stop offset="1" className="[stop-color:var(--s-orange-soft)]" />
        </linearGradient>
        <linearGradient id="sheet-ink" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" className="[stop-color:var(--s-orange)]" />
          <stop offset="1" className="[stop-color:var(--s-x-b9511e)]" />
        </linearGradient>
        <filter id="sheet-shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="10" stdDeviation="10" className="[flood-color:var(--s-orange)] [flood-opacity:.25]" />
        </filter>
      </defs>
      <motion.rect x="46" y="30" width="130" height="164" rx="10" fill="url(#sheet-back)"
        animate={{ rotate: fan ? 18 : 12, x: fan ? 14 : 6 }} transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        style={{ originX: '110px', originY: '190px' }} />
      <motion.rect x="42" y="26" width="130" height="164" rx="10" className="fill-orange-soft" filter="url(#sheet-shadow)"
        animate={{ rotate: fan ? 9 : 5, x: fan ? 6 : 2 }} transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        style={{ originX: '110px', originY: '190px' }} />
      <motion.g animate={{ rotate: fan ? -4 : 0, y: fan ? -4 : 0 }} transition={{ type: 'spring', stiffness: 200, damping: 20 }} style={{ originX: '110px', originY: '190px' }}>
        <rect x="34" y="20" width="130" height="164" rx="10" fill="url(#sheet-front)" filter="url(#sheet-shadow)" />
        {lines.map(([x, x2], i) => (
          <motion.line key={i} x1={x + 8} x2={x2} y1={48 + i * 16} y2={48 + i * 16} className="stroke-orange" strokeOpacity={0.45 - i * 0.08} strokeWidth="6" strokeLinecap="round"
            initial={{ pathLength: reduce ? 1 : 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.3 + i * 0.18, ease: EASE }} />
        ))}
        <text x="50" y="158" fill="url(#sheet-ink)" className="font-sans text-[64px] font-black italic">Aa</text>
        <motion.rect x="146" y="116" width="3" height="44" rx="1.5" className="fill-orange"
          animate={reduce ? undefined : { opacity: [1, 1, 0, 0] }} transition={{ duration: 1.1, repeat: Infinity, times: [0, 0.5, 0.5, 1] }} />
      </motion.g>
    </svg>
  )
}

/** 发布 · 纸飞机：沿虚线航迹飞向媒体节点，节点依次被点亮 */
export function PlaneArt({ active, className }: { active?: boolean; className?: string }) {
  const reduce = useReducedMotion()
  const route = 'M14 196 C 60 150, 70 110, 120 120 S 180 80, 196 34'
  return (
    <svg viewBox="0 0 220 220" className={cx('overflow-visible', className)} aria-hidden>
      <defs>
        <linearGradient id="plane-top" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" className="[stop-color:var(--s-bg)]" />
          <stop offset="1" className="[stop-color:var(--s-mint-soft)]" />
        </linearGradient>
        <linearGradient id="plane-wing" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0" className="[stop-color:var(--s-mint)]" />
          <stop offset="1" className="[stop-color:var(--s-mint)] [stop-opacity:.55]" />
        </linearGradient>
        <filter id="plane-shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="12" stdDeviation="9" className="[flood-color:var(--s-mint)] [flood-opacity:.3]" />
        </filter>
      </defs>
      <motion.path d={route} fill="none" className="stroke-mint" strokeOpacity=".4" strokeWidth="2" strokeDasharray="4 7"
        animate={reduce ? undefined : { strokeDashoffset: [0, -44] }} transition={{ duration: active ? 0.8 : 2.4, repeat: Infinity, ease: 'linear' }} />
      {[[14, 196], [66, 142], [120, 120], [168, 84]].map(([x, y], i) => (
        <motion.circle key={i} cx={x} cy={y} r="5" className="fill-surface stroke-mint" strokeWidth="2"
          initial={{ scale: reduce ? 1 : 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }}
          transition={{ delay: 0.4 + i * 0.15, type: 'spring', stiffness: 400, damping: 14 }} />
      ))}
      <motion.g
        animate={reduce ? undefined : active ? { x: 8, y: -8, rotate: -4 } : { x: [0, 3, 0], y: [0, -5, 0], rotate: 0 }}
        transition={active ? { type: 'spring', stiffness: 200, damping: 16 } : { duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        filter="url(#plane-shadow)"
      >
        <polygon points="206,20 96,82 136,100" fill="url(#plane-top)" className="stroke-mint" strokeOpacity=".25" />
        <polygon points="206,20 136,100 150,158" fill="url(#plane-wing)" />
        <polygon points="136,100 150,158 128,124" className="fill-mint" fillOpacity=".75" />
      </motion.g>
    </svg>
  )
}

