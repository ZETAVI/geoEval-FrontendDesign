import { useEffect, useRef, type ReactNode, type PointerEvent } from 'react'
import { animate, motion, useInView, useMotionValue, useReducedMotion, useSpring, useTransform, type MotionValue } from 'motion/react'

/** 动效基线：与 global.css 的 --s-ease 一致 */
export const EASE = [0.2, 0.8, 0.2, 1] as const
export const SPRING = { type: 'spring', stiffness: 260, damping: 26 } as const

export const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
}
export const rise = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
}

/** 数字滚动：进入视口时从 0 计到目标值 */
export function CountUp({ to, decimals = 0, duration = 1.2, className }: { to: number; decimals?: number; duration?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  const reduce = useReducedMotion()
  const mv = useMotionValue(0)
  useEffect(() => {
    if (!inView) return
    if (reduce) { mv.set(to); return }
    const c = animate(mv, to, { duration, ease: EASE })
    return () => c.stop()
  }, [inView, to, reduce, duration, mv])
  useEffect(() => mv.on('change', (v) => {
    if (ref.current) ref.current.textContent = v.toLocaleString('zh-CN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
  }), [mv, decimals])
  return <span ref={ref} className={className}>{(0).toFixed(decimals)}</span>
}

/** 指针跟随的轻微倾斜 + 视差，供服务卡使用 */
export function useTilt(max = 5) {
  const px = useMotionValue(0.5)
  const py = useMotionValue(0.5)
  const sx = useSpring(px, { stiffness: 180, damping: 22 })
  const sy = useSpring(py, { stiffness: 180, damping: 22 })
  const rotateY = useTransform(sx, [0, 1], [-max, max])
  const rotateX = useTransform(sy, [0, 1], [max, -max])
  const onPointerMove = (e: PointerEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    px.set((e.clientX - r.left) / r.width)
    py.set((e.clientY - r.top) / r.height)
  }
  const onPointerLeave = () => { px.set(0.5); py.set(0.5) }
  return { rotateX, rotateY, sx, sy, handlers: { onPointerMove, onPointerLeave } }
}

export function Parallax({ x, y, depth, children, className }: { x: MotionValue<number>; y: MotionValue<number>; depth: number; children: ReactNode; className?: string }) {
  const tx = useTransform(x, [0, 1], [-depth, depth])
  const ty = useTransform(y, [0, 1], [-depth, depth])
  return <motion.div style={{ x: tx, y: ty }} className={className}>{children}</motion.div>
}
