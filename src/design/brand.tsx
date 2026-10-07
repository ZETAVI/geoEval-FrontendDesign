import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'motion/react'
import { useEffect, useId } from 'react'
import { EASE } from './motion'
import { cx } from './shared'

/*
 * 洞点品牌图形：深蓝新月（被看见的品牌）+ 透光丝带（AI 的视线）+ 橙点（那个“点”）。
 * 同一套几何用于顶栏 Logo、首屏动态背景与诊断插画，保证视觉同源。
 * SVG 元素的旋转默认以自身包围盒中心为原点，所以每个旋转层都以几何中心构造。
 */

function Defs({ id }: { id: string }) {
  return (
    <defs>
      <linearGradient id={`${id}-moon`} x1="0" y1="1" x2=".8" y2="0">
        <stop offset="0" className="[stop-color:var(--s-brand-deep)]" />
        <stop offset="1" className="[stop-color:var(--s-brand)]" />
      </linearGradient>
      <linearGradient id={`${id}-rib`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" className="[stop-color:var(--s-x-c9dcff)]" />
        <stop offset=".6" className="[stop-color:var(--s-x-a7bfff)]" />
        <stop offset="1" className="[stop-color:var(--s-x-315cd8)]" />
      </linearGradient>
      <radialGradient id={`${id}-dot`} cx="35%" cy="30%" r="75%">
        <stop offset="0" className="[stop-color:var(--s-x-ffd0a7)]" />
        <stop offset="1" className="[stop-color:var(--s-orange)]" />
      </radialGradient>
      <mask id={`${id}-cut`}>
        <circle cx="110" cy="125" r="100" fill="white" />
        <ellipse cx="132" cy="112" rx="64" ry="72" transform="rotate(-22 132 112)" fill="black" />
      </mask>
    </defs>
  )
}

/** 静态 Logo：顶栏等小尺寸场景 */
export function LogoMark({ className }: { className?: string }) {
  const id = useId().replace(/:/g, '')
  return (
    <svg viewBox="0 0 240 240" className={className} aria-hidden>
      <Defs id={id} />
      <ellipse cx="138" cy="114" rx="74" ry="84" transform="rotate(-28 138 114)" fill="none" stroke={`url(#${id}-rib)`} strokeWidth="22" />
      <circle cx="110" cy="125" r="100" fill={`url(#${id}-moon)`} mask={`url(#${id}-cut)`} />
      <circle cx="206" cy="40" r="17" fill={`url(#${id}-dot)`} />
    </svg>
  )
}

/**
 * 首屏动态背景：Logo 拆成三层各自运动——新月缓慢自转、丝带呼吸摆动、橙点沿轨道巡游并发出信号波纹；
 * 外圈是雷达式的虚线轨道，整体随指针产生景深视差。
 */
export function LogoField({ className }: { className?: string }) {
  const id = useId().replace(/:/g, '')
  const reduce = useReducedMotion()
  const px = useMotionValue(0)
  const py = useMotionValue(0)
  const sx = useSpring(px, { stiffness: 60, damping: 18 })
  const sy = useSpring(py, { stiffness: 60, damping: 18 })
  const near = { x: useTransform(sx, (v) => v * 22), y: useTransform(sy, (v) => v * 22) }
  const far = { x: useTransform(sx, (v) => v * -10), y: useTransform(sy, (v) => v * -10) }

  useEffect(() => {
    if (reduce) return
    const on = (e: PointerEvent) => { px.set(e.clientX / innerWidth - 0.5); py.set(e.clientY / innerHeight - 0.5) }
    addEventListener('pointermove', on)
    return () => removeEventListener('pointermove', on)
  }, [reduce, px, py])

  const loop = (duration: number) => ({ duration, repeat: Infinity, ease: 'easeInOut' as const })

  return (
    <div className={cx('pointer-events-none absolute overflow-hidden', className)} aria-hidden>
      {/* 环境光 */}
      <motion.div style={far} className="absolute right-[8%] top-[-20%] size-[520px] rounded-full bg-brand-soft blur-3xl" />
      <motion.div style={far} animate={reduce ? undefined : { opacity: [0.5, 0.9, 0.5], scale: [1, 1.08, 1] }} transition={loop(9)}
        className="absolute right-[2%] top-[4%] size-[220px] rounded-full bg-orange-soft blur-3xl" />

      {/* 雷达轨道 */}
      <motion.svg style={far} viewBox="0 0 600 600" className="absolute -right-[160px] -top-[210px] w-[860px]">
        {[150, 210, 280].map((r, i) => (
          <motion.circle key={r} cx="300" cy="300" r={r} fill="none" className="stroke-brand" strokeOpacity={0.14 - i * 0.03} strokeDasharray={i === 1 ? '1 9' : '2 6'}
            animate={reduce ? undefined : { rotate: i % 2 ? -360 : 360 }} transition={{ duration: 90 + i * 30, repeat: Infinity, ease: 'linear' }} />
        ))}
        {/* 扫描扇区：AI 的视线扫过 */}
        <motion.g animate={reduce ? undefined : { rotate: 360 }} transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}>
          <circle cx="300" cy="300" r="280" fill="none" stroke="none" />
          <path d="M300 300 L580 300 A280 280 0 0 0 541 159 Z" className="fill-brand" fillOpacity=".05" />
        </motion.g>
      </motion.svg>

      {/* Logo 本体 */}
      <motion.svg style={near} viewBox="-20 -20 280 280" className="absolute right-[4%] top-[-30px] w-[340px] md:w-[400px]">
        <Defs id={id} />
        <motion.g animate={reduce ? undefined : { rotate: [-28, -14, -34, -28] }} transition={loop(14)}>
          <ellipse cx="138" cy="114" rx="74" ry="84" fill="none" stroke={`url(#${id}-rib)`} strokeWidth="22" strokeOpacity=".85" transform="rotate(-28 138 114)" />
        </motion.g>
        <motion.g initial={reduce ? false : { opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.2, ease: EASE }}>
          <motion.g animate={reduce ? undefined : { rotate: [0, 8, -4, 0] }} transition={loop(18)}>
            <circle cx="110" cy="125" r="100" fill={`url(#${id}-moon)`} mask={`url(#${id}-cut)`} />
          </motion.g>
        </motion.g>
        {/* 橙点：在轨道上巡游，持续发出“被看见”的信号 */}
        <motion.g animate={reduce ? undefined : { rotate: [0, 18, -10, 0] }} transition={loop(12)}>
          <circle cx="120" cy="120" r="122" fill="none" stroke="none" />
          {!reduce && [0, 1, 2].map((i) => (
            <motion.circle key={i} cx="206" cy="40" r="17" fill="none" className="stroke-orange" strokeWidth="1.5"
              animate={{ r: [17, 56], opacity: [0.55, 0] }} transition={{ duration: 3, repeat: Infinity, delay: i, ease: 'easeOut' }} />
          ))}
          <motion.circle cx="206" cy="40" r="17" fill={`url(#${id}-dot)`}
            animate={reduce ? undefined : { scale: [1, 1.1, 1] }} transition={loop(3)} />
        </motion.g>
      </motion.svg>

      {/* 画布底部淡出，保证正文对比度 */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-linear-to-t from-surface to-transparent" />
    </div>
  )
}

/**
 * 诊断插画：放大镜在一段“AI 回答”里逐行搜索，停在提到品牌的那一行时高亮。
 * 顶部 5 颗点代表 5 个 AI 平台，依次被扫描点亮——对应“4 个问题 × 5 个平台”的诊断含义。
 */
export function SearchArt({ active, className }: { active?: boolean; className?: string }) {
  const id = useId().replace(/:/g, '')
  const reduce = useReducedMotion()
  const d = active ? 3.2 : 6.4
  // 放大镜停靠点：扫过前两行 → 停在品牌行 → 离开
  const times = [0, 0.18, 0.36, 0.5, 0.72, 0.86, 1]
  const lx = [70, 130, 80, 96, 96, 140, 70]
  const ly = [96, 96, 116, 136, 136, 160, 96]
  const hit = [0, 0, 0, 1, 1, 0, 0]
  const lines = [[46, 150], [46, 128], [46, 156], [46, 118]]

  return (
    <svg viewBox="0 0 220 220" className={cx('overflow-visible', className)} aria-hidden>
      <defs>
        <linearGradient id={`${id}-sheet`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" className="[stop-color:var(--s-bg)]" />
          <stop offset="1" className="[stop-color:var(--s-brand-soft)]" />
        </linearGradient>
        <radialGradient id={`${id}-glass`} cx="35%" cy="30%" r="80%">
          <stop offset="0" className="[stop-color:var(--s-bg)] [stop-opacity:.95]" />
          <stop offset="1" className="[stop-color:var(--s-x-c9dcff)] [stop-opacity:.45]" />
        </radialGradient>
        <linearGradient id={`${id}-rim`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" className="[stop-color:var(--s-brand)]" />
          <stop offset="1" className="[stop-color:var(--s-brand-deep)]" />
        </linearGradient>
        <filter id={`${id}-sh`} x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="10" stdDeviation="10" className="[flood-color:var(--s-brand)] [flood-opacity:.18]" />
        </filter>
      </defs>

      {/* 回答卡 */}
      <rect x="28" y="36" width="160" height="150" rx="14" fill={`url(#${id}-sheet)`} filter={`url(#${id}-sh)`} />
      <rect x="28.5" y="36.5" width="159" height="149" rx="13.5" fill="none" className="stroke-brand" strokeOpacity=".12" />
      {/* 平台扫描点 */}
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.circle key={i} cx={48 + i * 14} cy="58" r="4"
          className={i === 0 ? 'fill-orange' : 'fill-brand'}
          animate={reduce ? { opacity: 1 } : { opacity: [0.2, 1, 1, 0.2] }}
          transition={{ duration: d, repeat: Infinity, times: [0, 0.1 + i * 0.12, 0.85, 1], ease: 'linear' }} />
      ))}
      <rect x="126" y="54" width="44" height="8" rx="4" className="fill-brand" fillOpacity=".1" />
      {/* 回答文字行，第 3 行是提到品牌的句子 */}
      <motion.rect x="38" y="127" width="132" height="18" rx="6" className="fill-orange-soft"
        animate={reduce ? { opacity: 1 } : { opacity: hit }} transition={{ duration: d, repeat: Infinity, times, ease: 'easeInOut' }} />
      {lines.map(([x1, x2], i) => (
        <line key={i} x1={x1} x2={x2} y1={96 + i * 20} y2={96 + i * 20} strokeWidth="6" strokeLinecap="round"
          className={i === 2 ? 'stroke-orange' : 'stroke-brand'} strokeOpacity={i === 2 ? 0.8 : 0.18} />
      ))}

      {/* 放大镜 */}
      <motion.g
        initial={false}
        animate={reduce ? { x: 96, y: 136 } : { x: lx, y: ly }}
        transition={{ duration: d, repeat: Infinity, times, ease: EASE }}
      >
        <line x1="17" y1="17" x2="38" y2="38" stroke={`url(#${id}-rim)`} strokeWidth="9" strokeLinecap="round" />
        <circle r="24" fill={`url(#${id}-glass)`} stroke={`url(#${id}-rim)`} strokeWidth="6" />
        <motion.circle r="7" className="fill-orange"
          animate={reduce ? { scale: 1 } : { scale: hit.map((h) => (h ? 1 : 0)) }} transition={{ duration: d, repeat: Infinity, times, ease: 'easeInOut' }} />
        <path d="M-12 -10 A16 16 0 0 1 2 -17" fill="none" className="stroke-surface" strokeWidth="3" strokeLinecap="round" strokeOpacity=".9" />
      </motion.g>
    </svg>
  )
}
