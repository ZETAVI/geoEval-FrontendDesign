import { useEffect, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { AlertCircle, Check, Loader2, X } from 'lucide-react'
import { EASE, SPRING } from './motion'
import { AnimatedNumber, cx } from './shared'
import { useFlow } from './flow'

/** 右侧抽屉：补救动作发生在这里，完成后用户仍留在原页面 */
export function Sheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  const closeRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (!open) return
    const prev = document.activeElement as HTMLElement | null
    closeRef.current?.focus()
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    addEventListener('keydown', k)
    return () => { removeEventListener('keydown', k); prev?.focus() }
  }, [open, onClose])
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} onClick={onClose} className="absolute inset-0 bg-scrim" />
          <motion.aside role="dialog" aria-modal="true" aria-label={title}
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ duration: 0.35, ease: EASE }}
            className="absolute inset-y-0 right-0 flex w-full max-w-[420px] flex-col bg-surface text-ink shadow-raised">
            <header className="flex items-center justify-between border-b border-line px-6 py-4">
              <h2 className="text-h2 font-bold">{title}</h2>
              <button ref={closeRef} onClick={onClose} aria-label="关闭" className="grid size-9 place-items-center rounded-control hover:bg-sunken"><X className="size-4" /></button>
            </header>
            <div className="flex-1 overflow-y-auto p-6">{children}</div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  )
}

/** 门槛提示：原因 + 补救入口（三段式：发生了什么 · 影响 · 怎么办） */
export function GateNotice({ title, desc, action, onAction, tone = 'warn' }: { title: string; desc: string; action: string; onAction: () => void; tone?: 'warn' | 'info' }) {
  return (
    <div role="status" className={cx('flex flex-wrap items-center gap-x-4 gap-y-2 rounded-control border px-4 py-3', tone === 'warn' ? 'border-orange/50 bg-orange-soft' : 'border-line bg-sunken')}>
      <AlertCircle className={cx('size-4 shrink-0', tone === 'warn' ? 'text-orange-ink' : 'text-ink-3')} />
      <div className="min-w-0 flex-1">
        <p className="text-body font-semibold">{title}</p>
        <p className="text-caption text-ink-2">{desc}</p>
      </div>
      <button onClick={onAction} className="h-9 rounded-full bg-ink px-4 text-caption font-semibold text-surface transition-opacity hover:opacity-85">{action}</button>
    </div>
  )
}

const QUICK = [100, 300, 500]

export type Via = '支付宝' | '微信支付'
const VIA = { 支付宝: { mark: '支', cls: 'bg-brand text-on-brand', hint: '跳转支付宝完成支付', pay: '等待支付宝结果…' }, 微信支付: { mark: '微', cls: 'bg-mint text-on-brand', hint: '微信扫码或在微信内确认', pay: '请在微信中确认支付…' } }
export const payingText = (v: Via) => VIA[v].pay
/** 支付方式：支付宝 / 微信支付 */
export function PayMethod({ value, onChange }: { value: Via; onChange: (v: Via) => void }) {
  return (
    <div className="grid gap-1.5">
      <span className="text-caption text-ink-2">支付方式</span>
      <div role="radiogroup" aria-label="支付方式" className="grid grid-cols-2 gap-2">
        {(Object.keys(VIA) as Via[]).map((v) => (
          <button key={v} role="radio" aria-checked={value === v} onClick={() => onChange(v)}
            className={cx('flex h-12 items-center gap-2.5 rounded-control border bg-surface px-3 text-left text-body transition-colors', value === v ? 'border-brand ring-4 ring-brand/10' : 'border-line hover:border-ink-3')}>
            <span className={cx('grid size-6 place-items-center rounded-md text-eyebrow font-bold', VIA[v].cls)}>{VIA[v].mark}</span>{v}
          </button>
        ))}
      </div>
      <p className="text-caption text-ink-3">{VIA[value].hint}</p>
    </div>
  )
}

/** 就地充值：积分不足时在抽屉里完成，成功后回到原页面继续 */
export function RechargeSheet() {
  const { gate, closeGate, balance, setBalance } = useFlow()
  const [yuan, setYuan] = useState(100)
  const [phase, setPhase] = useState<'idle' | 'paying' | 'done'>('idle')
  const [via, setVia] = useState<Via>('支付宝')
  const need = gate ?? 0
  const lack = Math.max(0, need - balance)
  useEffect(() => {
    if (gate == null) return
    setPhase('idle')
    setYuan(Math.max(100, Math.ceil(lack / 10 / 100) * 100))
  }, [gate]) // eslint-disable-line react-hooks/exhaustive-deps
  const pay = () => {
    setPhase('paying')
    setTimeout(() => { setBalance((b) => b + yuan * 10); setPhase('done'); setTimeout(closeGate, 900) }, 1200)
  }
  const after = balance + (phase === 'done' ? 0 : yuan * 10)
  return (
    <Sheet open={gate != null} onClose={closeGate} title="充值积分">
      <div className="grid gap-5">
        {need > 0 && (
          <p className="rounded-control bg-sunken p-4 text-body">
            这一步需要 <b className="tabular-nums">⚡{need.toLocaleString()}</b>，当前余额 <b className="tabular-nums">⚡{balance.toLocaleString()}</b>
            {lack > 0 ? <>，还差 <b className="tabular-nums text-orange-ink">⚡{lack.toLocaleString()}</b>。</> : <>，已经够了。</>}
          </p>
        )}
        <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="充值金额">
          {QUICK.map((v) => (
            <button key={v} role="radio" aria-checked={yuan === v} onClick={() => setYuan(v)}
              className={cx('rounded-control border px-3 py-3 text-left transition-colors', yuan === v ? 'border-brand bg-brand-soft ring-4 ring-brand/10' : 'border-line hover:border-ink-3')}>
              <b className="text-h3 tabular-nums">¥{v}</b>
              <span className="block text-eyebrow text-ink-2 tabular-nums">{v * 10} 积分</span>
            </button>
          ))}
        </div>
        <PayMethod value={via} onChange={setVia} />
        <dl className="grid gap-2 text-body">
          <div className="flex justify-between text-ink-2"><dt>充值后余额</dt><dd><AnimatedNumber value={after} prefix="⚡" className="font-bold text-ink tabular-nums" /></dd></div>
        </dl>
        <motion.button whileTap={{ scale: 0.98 }} onClick={pay} disabled={phase !== 'idle'}
          className={cx('flex h-12 items-center justify-center gap-2 rounded-control text-body font-semibold text-on-brand shadow-lg shadow-brand/25 transition-colors', phase === 'done' ? 'bg-mint' : 'bg-brand')}>
          {phase === 'idle' && `支付 ¥${yuan}`}
          {phase === 'paying' && <><Loader2 className="size-4 animate-spin" />{payingText(via)}</>}
          {phase === 'done' && <motion.span initial={{ scale: 0.6 }} animate={{ scale: 1 }} transition={SPRING} className="flex items-center gap-2"><Check className="size-4" strokeWidth={3} />已到账，回到原页面</motion.span>}
        </motion.button>
        <p className="text-caption text-ink-3">1 元 = 10 积分。支付完成后会自动回到你刚才的页面。</p>
      </div>
    </Sheet>
  )
}

/** 服务模块统一骨架：标题区 + 标签页 */
export function ModuleShell({ title, desc, eyebrow, aside, tabs, tab, onTab, children }: {
  title: string; desc: string; eyebrow?: string; aside?: ReactNode
  tabs: { id: string; label: string; badge?: string | number; dot?: boolean }[]
  tab: string; onTab: (id: string) => void; children: ReactNode
}) {
  return (
    <div className="relative">
    <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-linear-to-b from-accent-soft to-transparent" />
    <div className="relative mx-auto w-full max-w-[1120px] px-6 py-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          {eyebrow && <span className="mb-2 inline-flex items-center rounded-full bg-accent-soft px-2.5 py-0.5 text-eyebrow font-semibold text-accent-ink ring-1 ring-accent/20">{eyebrow}</span>}
          <h1 className="text-h1 font-bold">{title}</h1>
          <p className="mt-1 text-body text-ink-2">{desc}</p>
        </div>
        {aside}
      </header>
      <div role="tablist" className="mt-6 flex gap-1 border-b border-line">
        {tabs.map((t) => (
          <button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => onTab(t.id)}
            className={cx('relative flex h-11 items-center gap-2 px-4 text-body font-semibold transition-colors', tab === t.id ? 'text-accent-ink' : 'text-ink-3 hover:text-ink-2')}>
            {t.label}
            {t.badge != null && <span className={cx('rounded-full px-2 text-eyebrow tabular-nums', tab === t.id ? 'bg-accent-soft text-accent-ink' : 'bg-sunken text-ink-2')}>{t.badge}</span>}
            {t.dot && <span className="size-1.5 rounded-full bg-accent" />}
            {tab === t.id && <motion.span layoutId="shell-tab" transition={SPRING} className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-accent" />}
          </button>
        ))}
      </div>
      <div className="mt-6">{children}</div>
    </div>
    </div>
  )
}
