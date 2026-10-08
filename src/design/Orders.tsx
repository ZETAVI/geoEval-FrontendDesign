import { ArrowLeft, ArrowRight, Check, ChevronRight, Copy, ExternalLink, FileText, Headphones, RefreshCw, ShieldCheck } from 'lucide-react'
import { motion } from 'motion/react'
import { ITEM_LABEL, orderStats, type ItemStatus, type Order } from './data'
import { useFlow } from './flow'
import { Logo } from './MediaUI'
import { etaText, mediaById } from './media'
import { rise, stagger } from './motion'
import { Progress, cx } from './shared'

const ITEM_CLS: Record<ItemStatus, string> = {
  live: 'bg-mint-soft text-mint', review: 'bg-accent-soft text-accent-ink', queued: 'bg-sunken text-ink-2', failed: 'bg-orange-soft text-orange-ink',
}

/** 订单列表行：整行进入订单详情 */
export function OrderRow({ o }: { o: Order }) {
  const { go } = useFlow()
  const s = orderStats(o)
  const busy = s.busy
  return (
    <li className="border-b border-line last:border-0">
      <button onClick={() => go('order', { orderId: o.id })}
        className="grid w-full grid-cols-[auto_1fr_auto] items-center gap-4 rounded-control px-2 py-4 text-left transition-colors hover:bg-sunken/60 md:grid-cols-[auto_1.2fr_0.7fr_1.6fr_0.7fr_auto]">
        <span className={cx('grid size-9 place-items-center rounded-control', busy ? 'bg-accent-soft text-accent-ink' : 'bg-mint-soft text-mint')}><FileText className="size-4" /></span>
        <span><b className="font-semibold">{o.plan.split(' · ')[0]}</b><small className="block text-caption text-ink-3">{o.id} · {o.plan.split(' · ')[1]} · {o.mode === 'pack' ? '范围发布' : '指定媒体'}</small></span>
        <span className={cx('hidden items-center gap-1.5 text-caption md:flex', busy ? 'text-accent-ink' : 'text-mint')}>
          {busy ? <span className="relative flex size-2"><span className="absolute inset-0 animate-ping rounded-full bg-accent/50" /><span className="relative size-2 rounded-full bg-accent" /></span> : <Check className="size-3.5" strokeWidth={3} />}
          {s.status}
        </span>
        <span className="hidden items-center gap-3 md:flex"><Progress done={s.live} total={s.total} tone="mint" /><span className="shrink-0 text-caption tabular-nums text-ink-2">{s.live} / {s.total} 篇</span></span>
        <span className="hidden text-caption text-ink-3 md:block">{o.created.split(' ')[0]}</span>
        <ChevronRight className="size-4 text-ink-3" />
      </button>
    </li>
  )
}

const STAGES = { pack: ['已提交', '运维发布', '逐篇上线', '结算'], precise: ['已提交', '媒体审核', '逐篇上线', '结算'] }

export function OrderDetail() {
  const { orders, params, go } = useFlow()
  const o = orders.find((x) => x.id === params.orderId) ?? orders[0]
  if (!o) return null
  const s = orderStats(o)
  const pack = o.mode === 'pack'
  const reviewing = pack || o.items.some((i) => i.status === 'review')
  const stage = !s.busy ? 3 : s.live > 0 ? 2 : reviewing ? 1 : 0
  const groups: ItemStatus[] = ['live', 'review', 'queued', 'failed']
  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="grid gap-6 px-5 py-8 md:px-10">
      <motion.div variants={rise}>
        <button onClick={() => go('publish', { tab: 'orders' })} className="mb-3 flex items-center gap-1.5 text-caption text-ink-2 hover:text-ink"><ArrowLeft className="size-4" />发布订单</button>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-h1 font-black">{o.plan.split(' · ')[0]}</h1>
          <span className={cx('rounded-full px-3 py-1 text-caption font-semibold', s.busy ? 'bg-accent-soft text-accent-ink' : 'bg-mint-soft text-mint')}>{s.status}</span>
        </div>
        <p className="mt-1 flex flex-wrap items-center gap-x-4 text-caption text-ink-3"><span>{o.id}</span><span>{o.created} 提交</span><button onClick={() => navigator.clipboard?.writeText(o.id)} className="flex items-center gap-1 hover:text-ink"><Copy className="size-3" />复制订单号</button></p>
      </motion.div>

      <motion.ol variants={rise} className="grid grid-cols-4 gap-2 rounded-panel border border-line bg-surface p-5 shadow-soft" aria-label="订单进度">
        {STAGES[o.mode].map((t, i) => (
          <li key={t} className="relative grid justify-items-center gap-2 text-center">
            {i > 0 && <span className={cx('absolute right-1/2 top-3 h-0.5 w-full', i <= stage ? 'bg-mint' : 'bg-line')} />}
            <span className={cx('relative z-10 grid size-6 place-items-center rounded-full text-eyebrow font-bold', i < stage || (i === 3 && stage === 3) ? 'bg-mint text-on-brand' : i === stage ? 'bg-accent text-on-accent ring-4 ring-accent/20' : 'border border-mark bg-surface text-ink-3')}>
              {i < stage || (i === 3 && stage === 3) ? <Check className="size-3.5" strokeWidth={3} /> : i + 1}
            </span>
            <span className={cx('text-caption', i === stage ? 'font-semibold text-ink' : 'text-ink-2')}>{t}</span>
          </li>
        ))}
      </motion.ol>

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_320px]">
        <motion.section variants={rise} className="rounded-panel border border-line bg-surface p-5 shadow-soft md:p-6">
          <div className="mb-3 flex items-baseline justify-between"><h2 className="text-h3 font-bold">{pack ? '上线记录' : '各媒体进度'}</h2><span className="text-caption tabular-nums text-ink-3">{s.live} / {s.total} 已上线</span></div>
          {pack && (
            <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-control bg-sunken px-4 py-3 text-caption text-ink-2">
              <span className="font-semibold text-ink">发布范围</span>
              <span className="flex flex-wrap gap-1.5">{o.kinds?.map((k) => <span key={k} className="rounded-full bg-surface px-2.5 py-0.5">{k}</span>)}</span>
              {o.days && <span>预计 {o.days[0]}–{o.days[1]} 天陆续上线</span>}
            </div>
          )}
          {pack ? (
            <ul>
              {o.items.map((i) => {
                const m = mediaById(i.mediaId)
                return (
                  <li key={i.mediaId + i.time} className="flex items-center gap-3 border-b border-line py-3">
                    <Logo m={m} size="size-9" />
                    <span className="min-w-0 flex-1"><b className="block truncate text-body font-semibold">{m.name}</b><small className="text-caption text-ink-3">{i.time} 上线</small></span>
                    <span className={cx('rounded-full px-2.5 py-0.5 text-eyebrow font-semibold', ITEM_CLS.live)}>已上线</span>
                    <a href="#" onClick={(e) => e.preventDefault()} className="flex items-center gap-1 text-caption text-accent-ink hover:underline">原文<ExternalLink className="size-3" /></a>
                  </li>
                )
              })}
              {s.busy && s.total > s.live && (
                <li className="mt-3 flex items-center gap-3 rounded-control border border-dashed border-mark px-4 py-4 text-caption text-ink-2">
                  <span className="relative flex size-2.5 shrink-0"><span className="absolute inset-0 animate-ping rounded-full bg-accent/50" /><span className="relative size-2.5 rounded-full bg-accent" /></span>
                  <span>还有 <b className="tabular-nums text-ink">{s.total - s.live}</b> 篇待发布。运维发布后，媒体与链接会同步到这里。</span>
                </li>
              )}
              {!s.busy && s.failed > 0 && (
                <li className="mt-3 flex items-center gap-3 rounded-control bg-orange-soft px-4 py-3 text-caption text-orange-ink">有 {s.failed} 篇未能上线，已退回 ⚡{(o.refunded ?? s.refund).toLocaleString()}。</li>
              )}
            </ul>
          ) : (
            groups.map((g) => {
              const list = o.items.filter((i) => i.status === g)
              if (!list.length) return null
              return (
                <div key={g} className="mt-4 first:mt-0">
                  <p className="mb-1 text-eyebrow font-semibold text-ink-3">{ITEM_LABEL[g]} · {list.length}</p>
                  <ul>
                    {list.map((i) => {
                      const m = mediaById(i.mediaId)
                      return (
                        <li key={i.mediaId} className="flex items-center gap-3 border-b border-line py-3 last:border-0">
                          <Logo m={m} size="size-9" />
                          <span className="min-w-0 flex-1"><b className="block truncate text-body font-semibold">{m.name}</b><small className="text-caption text-ink-3">{i.time ? `${i.time} 上线` : g === 'failed' ? '未上线，已退回积分' : `预计 ${etaText(m.days)}`}</small></span>
                          <span className={cx('rounded-full px-2.5 py-0.5 text-eyebrow font-semibold', ITEM_CLS[g])}>{ITEM_LABEL[g]}</span>
                          {g === 'live' && <a href="#" onClick={(e) => e.preventDefault()} className="flex items-center gap-1 text-caption text-accent-ink hover:underline">原文<ExternalLink className="size-3" /></a>}
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )
            })
          )}
        </motion.section>

        <motion.aside variants={rise} className="grid gap-4 lg:sticky lg:top-6">
          <section className="rounded-panel border border-line bg-surface p-5 shadow-soft">
            <h2 className="text-h3 font-bold">订单信息</h2>
            <dl className="mt-3 grid gap-2.5 text-body">
              <div className="flex justify-between gap-3"><dt className="text-ink-2">方案</dt><dd className="font-semibold">{o.plan}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-ink-2">已付</dt><dd className="font-semibold tabular-nums">⚡{o.pts.toLocaleString()}</dd></div>
              {s.failed > 0 && <div className="flex justify-between gap-3"><dt className="text-ink-2">退回</dt><dd className="font-semibold tabular-nums text-orange-ink">⚡{(o.refunded ?? s.refund).toLocaleString()}</dd></div>}
              <div className="flex justify-between gap-3"><dt className="text-ink-2">结算</dt><dd className="text-right">{o.settleBy}</dd></div>
            </dl>
            <div className="mt-4 flex gap-2 rounded-control bg-sunken p-3 text-caption text-ink-2"><ShieldCheck className="mt-0.5 size-4 shrink-0 text-accent" /><p>订单不能取消。结束后 72 小时内结算，未上线的篇数退回积分。</p></div>
          </section>
          <section className="rounded-panel border border-line bg-surface p-5 shadow-soft">
            <h2 className="text-h3 font-bold">发布的文章</h2>
            <p className="mt-2 text-body">{o.article}</p>
            <button onClick={() => go('content', { tab: 'article' })} className="mt-3 flex items-center gap-1 text-caption text-accent-ink hover:underline">查看文章<ArrowRight className="size-3.5" /></button>
          </section>
          <div className="grid gap-2">
            <button onClick={() => go('running')} className="flex h-11 items-center justify-center gap-2 rounded-full bg-accent text-body font-semibold text-on-accent"><RefreshCw className="size-4" />复测一次</button>
            <button onClick={() => go('help', { compose: true, orderId: o.id })} className="flex h-11 items-center justify-center gap-2 rounded-full border border-line text-body hover:bg-sunken"><Headphones className="size-4" />订单有问题</button>
          </div>
        </motion.aside>
      </div>
    </motion.div>
  )
}
