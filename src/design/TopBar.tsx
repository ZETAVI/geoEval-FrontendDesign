import { useEffect, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Bell, Check, ChevronDown, FileText, LifeBuoy, Plus } from 'lucide-react'
import { LogoMark } from './brand'
import { EASE } from './motion'
import { AnimatedNumber, cx, type Page } from './shared'
import { useFlow } from './flow'
import { NOTICE_LABEL } from './data'

function Pop({ trigger, children, align = 'left' }: { trigger: (open: boolean, toggle: () => void) => ReactNode; children: (close: () => void) => ReactNode; align?: 'left' | 'right' }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const d = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false)
    const k = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    addEventListener('mousedown', d); addEventListener('keydown', k)
    return () => { removeEventListener('mousedown', d); removeEventListener('keydown', k) }
  }, [open])
  return (
    <div ref={ref} className="relative">
      {trigger(open, () => setOpen((v) => !v))}
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18, ease: EASE }}
            className={cx('absolute top-full z-30 mt-2 w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-panel border border-line bg-surface text-ink shadow-raised', align === 'right' ? 'right-0' : 'left-0')}>
            {children(() => setOpen(false))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const icon = 'grid size-9 place-items-center rounded-control transition-colors hover:bg-sunken'

function BrandMenu() {
  const { brands, brand, switchBrand, addBrand } = useFlow()
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  return (
    <Pop trigger={(open, t) => (
      <button onClick={t} aria-expanded={open} aria-haspopup="menu" className="flex items-center gap-2 rounded-control px-2 py-1 text-body transition-colors hover:bg-sunken">
        <span className="grid size-6 place-items-center rounded-md bg-brand-soft text-eyebrow font-black text-brand">{brand.name.slice(0, 1)}</span>
        <span className="max-w-32 truncate">{brand.name}</span><ChevronDown className="size-4 text-ink-3" />
      </button>
    )}>
      {(close) => (
        <div role="menu">
          <p className="px-4 pb-1 pt-3 text-eyebrow text-ink-3">我的品牌 · {brands.length}</p>
          <ul className="px-2">
            {brands.map((b) => (
              <li key={b.id}><button role="menuitemradio" aria-checked={b.id === brand.id} onClick={() => { switchBrand(b.id); close() }} className="flex w-full items-center gap-3 rounded-control px-2 py-2 text-left hover:bg-sunken">
                <span className="grid size-8 place-items-center rounded-control bg-brand-soft font-black text-brand">{b.name.slice(0, 1)}</span>
                <span className="min-w-0 flex-1"><b className="block truncate text-body font-semibold">{b.name}</b><small className="block truncate text-caption text-ink-3">{b.industry}</small></span>
                {b.id === brand.id && <Check className="size-4 text-brand" strokeWidth={3} />}
              </button></li>
            ))}
          </ul>
          <div className="border-t border-line p-2">
            {adding ? (
              <form onSubmit={(e) => { e.preventDefault(); if (name.trim().length >= 2) { addBrand(name.trim()); close(); setAdding(false); setName('') } }} className="grid gap-2 p-2">
                <input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="品牌名称，2 字以上" aria-label="品牌名称" className="h-10 rounded-control border border-line px-3 text-body outline-none focus:border-ink" />
                <div className="flex gap-2"><button type="button" onClick={() => setAdding(false)} className="h-9 flex-1 rounded-full border border-line text-caption">取消</button><button disabled={name.trim().length < 2} className="h-9 flex-1 rounded-full bg-accent text-caption font-semibold text-on-accent disabled:opacity-40">创建并补资料</button></div>
              </form>
            ) : (
              <button onClick={() => setAdding(true)} className="flex w-full items-center gap-2 rounded-control px-2 py-2 text-body text-brand hover:bg-sunken"><Plus className="size-4" />创建新品牌</button>
            )}
          </div>
        </div>
      )}
    </Pop>
  )
}

function NoticeMenu() {
  const { notices, readNotice, go } = useFlow()
  const unread = notices.filter((n) => n.unread).length
  return (
    <Pop align="right" trigger={(open, t) => (
      <button onClick={t} aria-expanded={open} className={cx(icon, 'relative')} aria-label={`通知，${unread} 条未读`}>
        <Bell className="size-4" />
        {unread > 0 && <span className="absolute right-1 top-1 grid min-w-4 place-items-center rounded-full border-2 border-surface bg-orange px-0.5 text-[10px] font-bold leading-none text-orange-ink">{unread}</span>}
      </button>
    )}>
      {(close) => (
        <div>
          <div className="flex items-center justify-between px-4 py-3"><h2 className="text-body font-bold">通知</h2><button onClick={() => readNotice()} disabled={!unread} className="text-caption text-brand disabled:text-ink-3">全部已读</button></div>
          <ul className="max-h-[360px] overflow-y-auto border-t border-line">
            {notices.map((n) => (
              <li key={n.id} className="border-b border-line last:border-0">
                <button onClick={() => { readNotice(n.id); if (n.to) go(n.to, n.to === 'help' ? { ticketId: n.ref } : n.to === 'order' ? { orderId: n.ref } : undefined); close() }} className="flex w-full gap-3 px-4 py-3 text-left hover:bg-sunken">
                  <span className={cx('mt-1.5 size-2 shrink-0 rounded-full', n.unread ? 'bg-orange' : 'bg-transparent')} />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2"><b className="text-body font-semibold">{n.title}</b><span className="rounded-full bg-sunken px-1.5 text-eyebrow text-ink-2">{NOTICE_LABEL[n.kind]}</span></span>
                    <small className="mt-0.5 block text-caption text-ink-2">{n.body}</small>
                    <small className="mt-0.5 block text-eyebrow text-ink-3">{n.time}</small>
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <p className="border-t border-line px-4 py-2.5 text-caption text-ink-3">通知仅在站内显示，保留 90 天。</p>
        </div>
      )}
    </Pop>
  )
}

export function TopBar({ page, go, balance, onProfile }: { page: Page; go: (p: Page) => void; balance: number; onProfile: () => void }) {
  return (
    <header className="relative z-20 flex items-center gap-3 border-b border-line/70 bg-surface/80 px-5 py-3 backdrop-blur-md md:px-8">
      <button onClick={() => go('home')} className="flex items-center gap-2 text-h3 font-bold tracking-tight text-brand"><LogoMark className="size-7" />洞点</button>
      <span className="h-5 w-px bg-line" />
      <BrandMenu />
      <nav className="ml-auto flex items-center gap-1 text-caption">
        <button onClick={onProfile} className="hidden items-center gap-1.5 rounded-control px-2.5 py-2 transition-colors hover:bg-sunken sm:flex"><FileText className="size-4" />品牌资料</button>
        <button onClick={() => go('help')} aria-current={page === 'help' ? 'page' : undefined} aria-label="帮助与客服" className={cx(icon, page === 'help' && 'bg-brand-soft text-brand')}><LifeBuoy className="size-4" /></button>
        <NoticeMenu />
        <button onClick={() => go('points')} aria-current={page === 'points' ? 'page' : undefined}
          className={cx('ml-1 flex items-center gap-1.5 rounded-full border px-3 py-1.5 transition-colors', page === 'points' ? 'border-brand/30 bg-brand-soft text-brand' : 'border-line hover:bg-sunken')}>
          <span className="text-orange">⚡</span><AnimatedNumber value={balance} className="font-semibold tabular-nums" />
        </button>
      </nav>
    </header>
  )
}
