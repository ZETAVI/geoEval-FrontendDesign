import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Check, Clock, Loader2, Minus, Receipt } from 'lucide-react'
import { LogoField } from './brand'
import { CountUp, EASE, rise, SPRING, stagger } from './motion'
import { AnimatedNumber, cx } from './shared'
import { PayMethod, payingText, type Via } from './ui'

type Rec = { id: string; pts: number; yuan: number; time: string; via: string; status: 'pending' | 'ok' | 'closed' }
const INITIAL: Rec[] = [
  { id: 'r4', pts: 1000, yuan: 100, time: '9月26日 18:00', via: '支付宝', status: 'pending' },
  { id: 'r3', pts: 3000, yuan: 300, time: '9月23日 15:20', via: '支付宝', status: 'ok' },
  { id: 'r2', pts: 500, yuan: 50, time: '9月20日 14:10', via: '微信支付', status: 'closed' },
  { id: 'r1', pts: 1000, yuan: 100, time: '9月18日 09:30', via: '支付宝', status: 'ok' },
]
const LEDGER = [
  { what: '媒体发布 · PO-0924 多点分布', delta: -900, time: '9月24日 11:02' },
  { what: '发布结算退回 · PO-0920 1 篇未上线', delta: 50, time: '9月25日 09:00' },
  { what: '充值到账', delta: 3000, time: '9月23日 15:21' },
  { what: '媒体发布 · PO-0920 基础覆盖', delta: -500, time: '9月20日 16:40' },
]
const STATUS = {
  pending: { label: '待支付', icon: Clock, cls: 'text-orange' },
  ok: { label: '充值成功', icon: Check, cls: 'text-mint' },
  closed: { label: '未支付', icon: Minus, cls: 'text-ink-3' },
}

/** 待支付倒计时：15 分钟内有效 */
function Countdown({ from = 14 * 60 + 32 }: { from?: number }) {
  const [s, setS] = useState(from)
  useEffect(() => { const t = setInterval(() => setS((v) => Math.max(0, v - 1)), 1000); return () => clearInterval(t) }, [])
  return <span className="tabular-nums">{String(Math.floor(s / 60)).padStart(2, '0')}:{String(s % 60).padStart(2, '0')}</span>
}

function Records({ recs, fresh }: { recs: Rec[]; fresh: string | null }) {
  const [tab, setTab] = useState<'ledger' | 'recharge' | 'invoice'>('recharge')
  const [filter, setFilter] = useState<'all' | Rec['status']>('all')
  const list = recs.filter((r) => filter === 'all' || r.status === filter)
  return (
    <section className="grid gap-2">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-line">
        <div role="tablist" className="flex gap-7">
          {([['ledger', '积分明细'], ['recharge', '充值记录'], ['invoice', '发票记录']] as const).map(([v, l]) => (
            <button key={v} role="tab" aria-selected={tab === v} onClick={() => setTab(v)}
              className={cx('relative py-3 text-body transition-colors', tab === v ? 'font-semibold text-brand' : 'text-ink-2 hover:text-ink')}>
              {l}
              {tab === v && <motion.span layoutId="rec-tab" transition={SPRING} className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-brand" />}
            </button>
          ))}
        </div>
        {tab === 'recharge' && (
          <label className="mb-2 flex items-center gap-2 text-caption text-ink-2">
            状态
            <select value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)} className="h-8 rounded-control border border-line bg-surface px-2 text-caption text-ink">
              <option value="all">全部</option><option value="pending">待支付</option><option value="ok">充值成功</option><option value="closed">未支付</option>
            </select>
          </label>
        )}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={tab + filter} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.22, ease: EASE }}>
          {tab === 'recharge' && (
            <>
              <div className="hidden grid-cols-[1.2fr_1fr_1.1fr_auto] gap-3 px-2 py-2 text-eyebrow text-ink-3 sm:grid"><span>积分与时间</span><span>实付与渠道</span><span>状态</span><span>操作</span></div>
              <ul>
                <AnimatePresence initial={false}>
                  {list.map((r) => {
                    const s = STATUS[r.status]
                    return (
                      <motion.li key={r.id} layout initial={{ opacity: 0, backgroundColor: 'var(--s-brand-soft)' }} animate={{ opacity: 1, backgroundColor: fresh === r.id ? 'var(--s-brand-soft)' : 'var(--s-bg)' }}
                        transition={{ duration: 0.6 }}
                        className="grid grid-cols-2 items-center gap-3 rounded-control border-b border-line px-2 py-3.5 text-body last:border-0 sm:grid-cols-[1.2fr_1fr_1.1fr_auto]">
                        <span><b className="tabular-nums">{r.pts.toLocaleString()} 积分</b><small className="block text-caption text-ink-3">{r.time}</small></span>
                        <span className="tabular-nums">¥{r.yuan}<small className="block text-caption text-ink-3">{r.via}</small></span>
                        <span className={cx('flex items-center gap-1.5', s.cls)}>
                          <s.icon className="size-4" strokeWidth={2.5} />{s.label}
                          {r.status === 'pending' && <small className="text-caption text-ink-3">· <Countdown /> 后关闭</small>}
                        </span>
                        <button className={cx('justify-self-start text-caption hover:underline sm:justify-self-end', r.status === 'pending' ? 'font-semibold text-orange' : 'text-brand')}>
                          {r.status === 'pending' ? '继续支付' : '详情'}
                        </button>
                      </motion.li>
                    )
                  })}
                </AnimatePresence>
              </ul>
            </>
          )}
          {tab === 'ledger' && (
            <ul>
              {LEDGER.map((l) => (
                <li key={l.time} className="flex items-center justify-between border-b border-line px-2 py-3.5 text-body last:border-0">
                  <span>{l.what}<small className="block text-caption text-ink-3">{l.time}</small></span>
                  <b className={cx('tabular-nums', l.delta > 0 ? 'text-mint' : 'text-ink')}>{l.delta > 0 ? '+' : ''}{l.delta.toLocaleString()}</b>
                </li>
              ))}
            </ul>
          )}
          {tab === 'invoice' && (
            <div className="my-4 grid place-items-center gap-2 rounded-panel border border-dashed border-line py-12 text-center">
              <span className="grid size-12 place-items-center rounded-full bg-brand-soft text-brand"><Receipt className="size-5" /></span>
              <p className="mt-2 text-body font-semibold">还没有开过发票</p>
              <p className="text-caption text-ink-2">充值成功的订单可开具个人或企业发票，约 3 个工作日内开出。</p>
              <button className="mt-3 rounded-full border border-line px-5 py-2 text-body transition-colors hover:bg-sunken">申请开票</button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </section>
  )
}

const TIERS = [100, 300, 500]
type Phase = 'idle' | 'paying' | 'done'

function Recharge({ onPaid }: { onPaid: (yuan: number, via: string) => void }) {
  const [tier, setTier] = useState<number | null>(100)
  const [custom, setCustom] = useState('')
  const [phase, setPhase] = useState<Phase>('idle')
  const [via, setVia] = useState<Via>('支付宝')
  const yuan = tier ?? (Number(custom) || 0)
  const invalid = tier === null && custom !== '' && (yuan < 1 || yuan > 100000)
  const submit = () => {
    setPhase('paying')
    setTimeout(() => { setPhase('done'); onPaid(yuan, via) }, 1400)
    setTimeout(() => setPhase('idle'), 3600)
  }
  return (
    <section aria-labelledby="rc" className="relative grid gap-5 overflow-hidden rounded-panel border border-line/80 bg-linear-to-b from-brand-soft via-surface to-surface bg-surface p-6 shadow-soft lg:sticky lg:top-6">
      <div>
        <h2 id="rc" className="text-h2 font-bold">充值积分</h2>
        <p className="mt-1 text-caption text-ink-2">选好金额，1 元得 10 积分</p>
      </div>
      <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="充值档位">
        {TIERS.map((t) => (
          <button key={t} role="radio" aria-checked={tier === t} onClick={() => { setTier(t); setCustom('') }}
            className={cx('relative rounded-control border px-3 py-3 text-left transition-colors', tier === t ? 'border-transparent' : 'border-line bg-surface hover:border-ink-3')}>
            {tier === t && <motion.span layoutId="tier" transition={SPRING} className="absolute inset-0 rounded-control border-2 border-brand bg-brand-soft/60" />}
            <span className="relative flex items-center gap-1.5">
              <span className={cx('grid size-3.5 place-items-center rounded-full border-2 transition-colors', tier === t ? 'border-brand' : 'border-ink-3')}>
                {tier === t && <motion.span layoutId="tier-dot" className="size-1.5 rounded-full bg-brand" />}
              </span>
              <b className={cx('text-h3 tabular-nums', tier === t && 'text-brand')}>¥{t}</b>
            </span>
            <span className="relative mt-0.5 block text-eyebrow text-ink-2 tabular-nums">{(t * 10).toLocaleString()} 积分</span>
          </button>
        ))}
      </div>
      <label className="grid gap-1.5 text-caption text-ink-2">
        自定义金额（元）
        <input inputMode="numeric" value={custom} aria-invalid={invalid}
          onChange={(e) => { const v = e.target.value.replace(/\D/g, ''); setCustom(v); setTier(v ? null : 100) }}
          placeholder="请输入金额"
          className={cx('h-11 rounded-control border bg-surface px-3 text-body text-ink outline-none transition-shadow focus:ring-4 focus:ring-brand/15', invalid ? 'border-danger' : 'border-line focus:border-brand')} />
        <span className={cx(invalid && 'text-danger')}>{invalid ? '金额需为 1–100000 的整数' : '1–100000 元，整数'}</span>
      </label>
      <PayMethod value={via} onChange={setVia} />
      <dl className="grid gap-2 rounded-control bg-sunken p-4 text-body">
        <div className="flex items-baseline justify-between text-ink-2"><dt>获得积分</dt><dd><AnimatedNumber value={yuan * 10} className="text-h3 font-bold text-ink tabular-nums" /></dd></div>
        <div className="flex items-baseline justify-between text-ink-2"><dt>实际支付</dt><dd><AnimatedNumber value={yuan} prefix="¥" className="text-h3 font-bold text-ink tabular-nums" /></dd></div>
      </dl>
      <motion.button whileTap={{ scale: 0.98 }} onClick={submit} disabled={!yuan || invalid || phase !== 'idle'}
        className={cx('relative h-12 overflow-hidden rounded-control text-body font-semibold text-on-brand shadow-lg shadow-brand/25 transition-colors disabled:cursor-not-allowed', phase === 'done' ? 'bg-mint' : 'bg-brand disabled:opacity-50', phase !== 'idle' && 'disabled:opacity-100')}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.span key={phase} initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -16, opacity: 0 }} transition={{ duration: 0.2 }} className="flex items-center justify-center gap-2">
            {phase === 'idle' && <>确认充值</>}
            {phase === 'paying' && <><Loader2 className="size-4 animate-spin" /> {payingText(via)}</>}
            {phase === 'done' && <><Check className="size-4" strokeWidth={3} /> 已到账 {(yuan * 10).toLocaleString()} 积分</>}
          </motion.span>
        </AnimatePresence>
      </motion.button>
    </section>
  )
}

export function Points({ balance, setBalance }: { balance: number; setBalance: (fn: (b: number) => number) => void }) {
  const [recs, setRecs] = useState(INITIAL)
  const [fresh, setFresh] = useState<string | null>(null)
  const [pulse, setPulse] = useState(0)
  const onPaid = (yuan: number, via: string) => {
    const id = `n${Date.now()}`
    setRecs((r) => [{ id, pts: yuan * 10, yuan, time: '刚刚', via, status: 'ok' }, ...r])
    setFresh(id); setTimeout(() => setFresh(null), 1800)
    setBalance((b) => b + yuan * 10); setPulse((p) => p + 1)
  }
  return (
    <div className="relative overflow-hidden">
      <LogoField className="inset-x-0 top-0 h-[360px] opacity-60" />
      <motion.div variants={stagger} initial="hidden" animate="show" className="relative grid gap-10 px-5 pb-10 pt-12 md:px-10 lg:grid-cols-[1fr_400px]">
        <div className="grid content-start gap-10">
          <motion.header variants={rise}>
            <h1 className="text-[clamp(2rem,4vw,2.75rem)] font-black tracking-tight">积分账户</h1>
            <p className="mt-5 text-caption text-ink-2">可用积分</p>
            <div className="mt-1 flex items-center gap-3">
              <motion.svg key={pulse} viewBox="0 0 24 24" className="size-14 drop-shadow-lg" aria-hidden
                initial={pulse ? { scale: 1.35, rotate: -12 } : { scale: 0.6, opacity: 0 }} animate={{ scale: 1, rotate: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 12 }}>
                <defs><linearGradient id="bolt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" className="[stop-color:var(--s-x-ffd0a7)]" /><stop offset="1" className="[stop-color:var(--s-orange)]" /></linearGradient></defs>
                <path d="M13.5 2 4.5 13.5h6L9.5 22l9-12h-6.2L13.5 2Z" fill="url(#bolt)" />
              </motion.svg>
              <span className="text-[clamp(3.25rem,7.5vw,5rem)] font-black leading-none tracking-tight text-brand-deep tabular-nums">
                {pulse ? <AnimatedNumber value={balance} /> : <CountUp to={balance} />}
              </span>
            </div>
            <p className="mt-2 pl-[4.25rem] text-caption text-ink-3">所有品牌共用 · 未发布成功的篇数会退回积分</p>
          </motion.header>
          <motion.div variants={rise}><Records recs={recs} fresh={fresh} /></motion.div>
        </div>
        <motion.div variants={rise} className="self-start"><Recharge onPaid={onPaid} /></motion.div>
      </motion.div>
    </div>
  )
}
