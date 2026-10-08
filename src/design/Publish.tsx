import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowRight, Check, ChevronRight, FileText, Search, ShieldCheck } from 'lucide-react'
import { useFlow } from './flow'
import { EASE, SPRING } from './motion'
import { cx } from './shared'
import { GateNotice, ModuleShell, Sheet } from './ui'
import { OrderRow } from './Orders'
import { Logo } from './MediaUI'
import { ETA_DESC, KINDS, KIND_DESC, MEDIA, etaText, mediaById, type Kind, type Media } from './media'
import { PACKS, orderStats, type Order } from './data'
import { MediaDetail, PackPicker } from './PublishParts'

function Check4({ on }: { on: boolean }) {
  return <span className={cx('grid size-5 shrink-0 place-items-center rounded-md border-2 transition-colors', on ? 'border-accent bg-accent text-on-accent' : 'border-ink-3')}>{on && <Check className="size-3" strokeWidth={4} />}</span>
}

function ModeToggle({ mode, set }: { mode: 'pack' | 'precise'; set: (m: 'pack' | 'precise') => void }) {
  return (
    <div className="relative inline-grid grid-cols-2 rounded-full bg-sunken p-1 text-body" role="radiogroup" aria-label="发布方式">
      {(['pack', 'precise'] as const).map((v) => (
        <button key={v} role="radio" aria-checked={mode === v} onClick={() => set(v)} className={cx('relative z-10 h-10 rounded-full px-6 transition-colors', mode === v ? 'font-semibold text-on-accent' : 'text-ink-2')}>
          {mode === v && <motion.span layoutId="pub-mode-main" transition={SPRING} className="absolute inset-0 -z-10 rounded-full bg-accent" />}
          {v === 'pack' ? '套餐发布' : '精准发布'}
        </button>
      ))}
    </div>
  )
}

function Pill({ on, children, onClick }: { on: boolean; children: React.ReactNode; onClick: () => void }) {
  return <button aria-pressed={on} onClick={onClick} className={cx('h-8 rounded-full px-3.5 text-caption transition-colors', on ? 'bg-accent-soft font-semibold text-accent-ink ring-1 ring-accent/30' : 'bg-sunken text-ink-2 hover:bg-line')}>{children}</button>
}

function MediaCard({ m, on, selectable, toggle, open }: { m: Media; on: boolean; selectable: boolean; toggle: () => void; open: () => void }) {
  return (
    <li className="list-none">
      <div className={cx('group relative flex h-full flex-col gap-3 rounded-panel border bg-surface p-4 shadow-soft transition-[box-shadow,transform] hover:-translate-y-0.5 hover:shadow-raised', on ? 'border-accent bg-accent-soft/50' : 'border-line')}>
        <button onClick={open} aria-label={`查看${m.name}详情`} className="absolute inset-0 rounded-panel outline-offset-2 focus-visible:outline-2 focus-visible:outline-accent" />
        <span className="pointer-events-none flex items-start justify-between gap-2">
          <Logo m={m} size="size-12" />
          <ChevronRight className="mt-1 size-4 text-ink-3 opacity-0 transition-opacity group-hover:opacity-100" />
        </span>
        <span className="pointer-events-none min-w-0"><b className="block truncate text-body font-semibold">{m.name}</b><span className="mt-0.5 block text-caption text-ink-3">{m.intro}</span></span>
        <span className="pointer-events-none mt-auto flex items-baseline justify-between border-t border-line pt-3"><b className="text-body font-black tabular-nums text-accent-ink">⚡{m.pts}</b><span className="text-caption text-ink-2">{etaText(m.days)}</span></span>
        {selectable && (
          <button onClick={toggle} aria-pressed={on} aria-label={on ? `取消选择${m.name}` : `选择${m.name}`} className={cx('absolute right-3 top-3 z-10 grid size-7 place-items-center rounded-full border-2 transition-colors group-hover:right-8', on ? 'border-accent bg-accent text-on-accent' : 'border-mark bg-surface hover:border-accent')}>{on && <Check className="size-4" strokeWidth={3} />}</button>
        )}
      </div>
    </li>
  )
}

function Library({ selectable, picked, toggle, goPlans, open }: { selectable: boolean; picked: string[]; toggle: (id: string) => void; goPlans: () => void; open: (id: string) => void }) {
  const [kind, setKind] = useState<Kind | '全部'>('全部')
  const [q, setQ] = useState('')
  const [sort, setSort] = useState<'pts' | 'days'>('pts')
  const list = useMemo(() => MEDIA.filter((m) => !q.trim() || m.name.includes(q.trim())), [q])
  const key = (m: Media) => (sort === 'pts' ? m.pts : m.days[1])
  const kinds = kind === '全部' ? KINDS : [kind]
  const count = (k: Kind) => list.filter((m) => m.kind === k).length
  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center gap-3">
        <div role="tablist" aria-label="媒体类别" className="flex flex-wrap gap-2">
          {(['全部', ...KINDS] as const).map((k) => (
            <button key={k} role="tab" aria-selected={kind === k} onClick={() => setKind(k)} className={cx('h-9 rounded-full px-4 text-body transition-colors', kind === k ? 'bg-accent-soft font-semibold text-accent-ink ring-1 ring-accent/30' : 'bg-sunken text-ink-2 hover:bg-line')}>
              {k}<span className="ml-1.5 text-caption opacity-60 tabular-nums">{k === '全部' ? list.length : count(k)}</span>
            </button>
          ))}
        </div>
        <div className="relative ml-auto">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-3" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="搜索媒体名称" aria-label="搜索媒体" className="h-9 w-48 rounded-full border border-line bg-surface pl-9 pr-3 text-caption outline-none focus:border-accent focus:ring-4 focus:ring-accent/20" />
        </div>
        <span className="flex items-center gap-2 text-caption text-ink-3">排序
          <Pill on={sort === 'pts'} onClick={() => setSort('pts')}>价格</Pill><Pill on={sort === 'days'} onClick={() => setSort('days')}>上线速度</Pill>
        </span>
      </div>
      {!selectable && (
        <p className="flex flex-wrap items-center gap-3 rounded-control bg-sunken px-4 py-3 text-caption text-ink-2">浏览模式。想自己挑媒体，请用精准发布。<button onClick={goPlans} className="font-semibold text-accent-ink underline underline-offset-4">去切换</button></p>
      )}
      {kinds.map((k) => {
        const items = list.filter((m) => m.kind === k).sort((a, b) => key(a) - key(b))
        if (!items.length) return null
        return (
          <section key={k} aria-label={k} className="grid gap-3">
            <div className="flex items-baseline gap-3"><h2 className="text-h3 font-bold">{k}</h2><span className="text-caption text-ink-3">{items.length} 家 · {KIND_DESC[k]}</span></div>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{items.map((m) => <MediaCard key={m.id} m={m} on={picked.includes(m.id)} selectable={selectable} toggle={() => toggle(m.id)} open={() => open(m.id)} />)}</ul>
          </section>
        )
      })}
      {!list.length && <p className="py-10 text-center text-caption text-ink-3">没有找到“{q}”。</p>}
      <p className="text-caption text-ink-3">上线时间：{ETA_DESC}</p>
    </div>
  )
}

function Orders() {
  const { orders, go } = useFlow()
  const [f, setF] = useState<'all' | 'busy' | 'done'>('all')
  const list = orders.filter((o) => f === 'all' || (f === 'busy') === orderStats(o).busy)
  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-2">
        {([['all', '全部'], ['busy', '发布中'], ['done', '已完成']] as const).map(([k, l]) => <Pill key={k} on={f === k} onClick={() => setF(k)}>{l}</Pill>)}
        <span className="ml-auto text-caption text-ink-3">订单结束后 72 小时内结算，未上线的篇数退回积分</span>
      </div>
      <section className="rounded-panel border border-line bg-surface p-4 shadow-soft md:p-6">
        {list.length ? <ul>{list.map((o) => <OrderRow key={o.id} o={o} />)}</ul>
          : <div className="grid justify-items-center gap-3 py-10 text-center"><p className="text-caption text-ink-3">{orders.length ? '这个状态下没有订单。' : '还没有发布订单。选好方案并提交后，每家媒体的上线进度会显示在这里。'}</p>{!orders.length && <button onClick={() => go('publish', { tab: 'plans' })} className="h-10 rounded-full bg-accent px-5 text-body font-semibold text-on-accent">去选发布方案</button>}</div>}
      </section>
    </div>
  )
}

export function Publish() {
  const { article, go, balance, setBalance, openGate, addOrder, orders, params } = useFlow()
  const [tab, setTab] = useState(params.tab ?? 'plans')
  const [mode, setMode] = useState<'pack' | 'precise'>('pack')
  const [pack, setPack] = useState('multi')
  const [picked, setPicked] = useState<string[]>([])
  const [detail, setDetail] = useState<string | null>(null)
  const [review, setReview] = useState(false)
  const [terms, setTerms] = useState(false)
  const [sent, setSent] = useState<{ id: string; pts: number; n: number } | null>(null)

  const confirmed = article?.status === 'confirmed' ? article : null
  const sel = PACKS.find((p) => p.id === pack)!
  const pts = mode === 'pack' ? sel.pts : picked.reduce((a, id) => a + mediaById(id).pts, 0)
  const n = mode === 'pack' ? sel.n : picked.length
  const plan = mode === 'pack' ? `${sel.name} · ${sel.n} 篇` : `精准发布 · ${picked.length} 家`
  const short = pts > balance
  const ready = !!confirmed && n > 0
  const toggle = (id: string) => setPicked((v) => (v.includes(id) ? v.filter((x) => x !== id) : [...v, id]))

  const submit = () => {
    const id = `PO-${String(Math.floor(Math.random() * 9000) + 1000)}`
    setBalance((b) => b - pts)
    addOrder({
      id, article: confirmed!.title, plan, mode, pts, total: n, created: '刚刚', settleBy: '订单结束后 72 小时内结算', settled: false,
      ...(mode === 'pack' ? { kinds: sel.kinds, days: sel.days, items: [] } : { items: picked.map((mediaId) => ({ mediaId, status: 'queued' as const })) }),
    } satisfies Order)
    setReview(false); setTerms(false); setSent({ id, pts, n })
  }

  if (sent) {
    return (
      <div className="px-5 py-16 md:px-10">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }} className="mx-auto grid max-w-xl justify-items-center gap-4 text-center">
          <span className="grid size-16 place-items-center rounded-full bg-accent text-on-accent"><motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, ...SPRING }}><Check className="size-8" strokeWidth={3} /></motion.span></span>
          <h1 className="text-h1 font-black">订单已提交</h1>
          <p className="text-body text-ink-2">共 {sent.n} 篇，已扣除 <b className="tabular-nums text-ink">⚡{sent.pts.toLocaleString()}</b>。上线记录会逐条同步到订单里，并通知你。</p>
          <p className="max-w-md rounded-control bg-sunken px-4 py-3 text-caption text-ink-2">订单结束后 72 小时内结算，没有上线的篇数会按约定退回积分。</p>
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            <button onClick={() => { go('order', { orderId: sent.id }); setSent(null) }} className="flex h-12 items-center gap-2 rounded-full bg-accent px-7 text-body font-semibold text-on-accent shadow-lg shadow-accent/30">查看订单<ArrowRight className="size-4" /></button>
            <button onClick={() => go('running')} className="h-12 rounded-full border border-line px-6 text-body hover:bg-sunken">稍后复测一次</button>
          </div>
        </motion.div>
      </div>
    )
  }

  const showBar = tab === 'plans' || (tab === 'library' && mode === 'precise')
  return (
    <div className="pb-24">
      <ModuleShell title="媒体发布" eyebrow="第 3 步 · 发布" desc="买套餐或自选媒体，把文章发出去" tab={tab} onTab={(t) => { setTab(t); setDetail(null) }}
        tabs={[{ id: 'plans', label: '发布方案' }, { id: 'library', label: '媒体库', badge: MEDIA.length }, { id: 'orders', label: '发布订单', badge: orders.length || undefined }]}
        aside={tab === 'plans' ? <ModeToggle mode={mode} set={setMode} /> : undefined}>
        {tab !== 'orders' ? (
          <div className="mb-5">
            {tab !== 'orders' && (confirmed ? (
              <div className="flex items-center gap-3 rounded-control border border-line bg-surface px-4 py-3 shadow-soft">
                <span className="grid size-9 place-items-center rounded-control bg-accent-soft"><FileText className="size-4" /></span>
                <div className="min-w-0 flex-1"><p className="text-caption text-ink-3">发布的文章</p><p className="truncate text-body font-semibold">{confirmed.title}</p></div>
                <button onClick={() => go('content', { tab: 'article' })} className="text-caption text-ink-2 hover:text-ink hover:underline">查看</button>
              </div>
            ) : tab === 'plans' && <GateNotice title={article ? '文章还是草稿，确认后才能发布' : '还没有可发布的文章'} desc="发布会把文章原文送到媒体，所以需要先在品牌内容里确认。" action={article ? '去确认文章' : '去写文章'} onAction={() => go('content', { tab: 'article' })} />)}
          </div>
        ) : null}

        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={tab + (tab === 'plans' ? mode : '') + (detail ?? '')} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3, ease: EASE }}>
            {tab === 'plans' && mode === 'pack' && <PackPicker pack={pack} setPack={setPack} disabled={!confirmed} />}
            {tab === 'plans' && mode === 'precise' && (
              <div className="grid justify-items-start gap-4 rounded-panel border border-line bg-surface p-6 shadow-soft">
                <p className="text-body text-ink-2">精准发布要自己在媒体库里挑选，每家按各自的价格计费。</p>
                {picked.length > 0 && <div className="flex flex-wrap gap-2">{picked.map((id) => <span key={id} className="flex items-center gap-2 rounded-full bg-sunken py-1 pl-1 pr-3 text-caption"><Logo m={mediaById(id)} size="size-6 !rounded-full text-eyebrow" />{mediaById(id).name}</span>)}</div>}
                <button onClick={() => setTab('library')} className="flex h-11 items-center gap-2 rounded-full bg-accent px-6 text-body font-semibold text-on-accent">{picked.length ? '继续挑选' : '去媒体库挑选'}<ArrowRight className="size-4" /></button>
              </div>
            )}
            {tab === 'library' && (detail
              ? <MediaDetail m={mediaById(detail)} selectable={mode === 'precise'} on={picked.includes(detail)} toggle={() => toggle(detail)} back={() => setDetail(null)} open={setDetail} />
              : <Library selectable={mode === 'precise'} picked={picked} toggle={toggle} goPlans={() => { setMode('precise'); setTab('library') }} open={setDetail} />)}
            {tab === 'orders' && <Orders />}
          </motion.div>
        </AnimatePresence>
      </ModuleShell>

      {showBar && (
        <div className="sticky bottom-4 mx-auto max-w-[1120px] px-6">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-panel border border-line bg-surface/95 px-5 py-3 shadow-raised backdrop-blur-md">
            <p className="text-body text-ink-2" aria-live="polite">{mode === 'pack' ? plan : n ? `已选 ${n} 家` : '还没有选择媒体'}</p>
            <p className="flex items-baseline gap-1"><span className="text-caption text-ink-3">合计</span><b className="text-h2 font-black tabular-nums text-accent-ink">⚡{pts.toLocaleString()}</b></p>
            <span className="text-caption text-ink-3">余额 ⚡{balance.toLocaleString()}</span>
            <div className="ml-auto flex items-center gap-3">
              {ready && short && <button onClick={() => openGate(pts)} className="text-caption font-semibold text-danger underline underline-offset-4">还差 ⚡{(pts - balance).toLocaleString()}，去充值</button>}
              <motion.button whileTap={{ scale: 0.97 }} disabled={!ready || short} onClick={() => setReview(true)}
                className="flex h-11 items-center gap-2 rounded-full bg-accent px-6 text-body font-semibold text-on-accent shadow-lg shadow-accent/30 transition-opacity disabled:cursor-not-allowed disabled:opacity-40">
                下一步：确认订单<ArrowRight className="size-4" />
              </motion.button>
            </div>
          </div>
        </div>
      )}

      <Sheet open={review} onClose={() => setReview(false)} title="确认订单">
        <div className="grid gap-5">
          <dl className="grid gap-3 text-body">
            <div className="flex justify-between gap-4"><dt className="text-ink-2">文章</dt><dd className="text-right font-semibold">{confirmed?.title}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-ink-2">方式</dt><dd className="font-semibold">{plan}</dd></div>
            <div className="flex justify-between gap-4 border-t border-line pt-3"><dt className="text-ink-2">需要积分</dt><dd className="text-h3 font-black tabular-nums">⚡{pts.toLocaleString()}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-ink-2">提交后余额</dt><dd className="tabular-nums">⚡{(balance - pts).toLocaleString()}</dd></div>
          </dl>
          <div className="flex gap-3 rounded-control bg-sunken p-4 text-caption text-ink-2">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-accent" />
            <p>提交后不能取消。订单结束后 72 小时内结算，没有上线的篇数会退回积分。</p>
          </div>
          <label className="flex cursor-pointer items-start gap-3 text-body">
            <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} className="peer sr-only" />
            <Check4 on={terms} />
            <span>我已阅读并同意<a href="#" onClick={(e) => e.preventDefault()} className="text-accent-ink underline">《媒体发布服务条款》</a></span>
          </label>
          <motion.button whileTap={{ scale: 0.98 }} disabled={!terms} onClick={submit} className="h-12 rounded-control bg-accent text-body font-semibold text-on-accent shadow-lg shadow-accent/30 transition-opacity disabled:cursor-not-allowed disabled:opacity-40">
            确认发布，扣除 ⚡{pts.toLocaleString()}
          </motion.button>
        </div>
      </Sheet>
    </div>
  )
}
