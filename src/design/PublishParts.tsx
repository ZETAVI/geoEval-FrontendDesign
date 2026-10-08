import { motion } from 'motion/react'
import { ArrowLeft, Check, ChevronRight, Clock, Coins, Lock, Plus, ShieldCheck } from 'lucide-react'
import { SPRING } from './motion'
import { AnimatedNumber, cx } from './shared'
import { Logo } from './MediaUI'
import { ETA_DESC, KINDS, KIND_DESC, KIND_FACTS, MEDIA, etaText, type Media } from './media'
import { PACKS } from './data'

/** 套餐：上面选档位，下面一块面板随档位变化——哪些类别入选、各有哪些媒体、多少钱 */
export function PackPicker({ pack, setPack, disabled }: { pack: string; setPack: (id: string) => void; disabled: boolean }) {
  const sel = PACKS.find((p) => p.id === pack)!
  return (
    <div className={cx('grid gap-3', disabled && 'pointer-events-none opacity-50')}>
      <div role="radiogroup" aria-label="套餐档位" className="grid gap-2 sm:grid-cols-3">
        {PACKS.map((p) => {
          const on = pack === p.id
          return (
            <button key={p.id} role="radio" aria-checked={on} onClick={() => setPack(p.id)}
              className={cx('relative flex items-center justify-between gap-3 rounded-panel border px-5 py-4 text-left transition-colors', on ? 'border-transparent' : 'border-line bg-surface hover:border-ink-3')}>
              {on && <motion.span layoutId="pack-tier" transition={SPRING} className="absolute inset-0 rounded-panel border-2 border-accent bg-accent-soft" />}
              <span className="relative min-w-0">
                <b className={cx('flex items-center gap-2 text-h3 font-bold', on && 'text-accent-ink')}>{p.name}{p.tag && <span className="rounded-full bg-accent px-2 py-0.5 text-eyebrow font-semibold text-on-accent">{p.tag}</span>}</b>
                <span className="mt-0.5 block text-caption text-ink-2">{p.desc}</span>
              </span>
              <span className="relative shrink-0 text-right"><b className={cx('block text-h2 font-black tabular-nums', on ? 'text-accent-ink' : 'text-ink')}>⚡{p.pts}</b><span className="text-eyebrow text-ink-3">{p.n} 篇</span></span>
            </button>
          )
        })}
      </div>

      <section className="grid overflow-hidden rounded-panel border border-line bg-surface shadow-soft lg:grid-cols-[1fr_17rem]" aria-label="套餐覆盖范围">
        <ul className="divide-y divide-line">
          {KINDS.map((k) => {
            const inc = sel.kinds.includes(k)
            const ms = MEDIA.filter((m) => m.kind === k)
            return (
              <li key={k} className="relative flex items-center gap-4 px-5 py-3.5">
                <motion.span aria-hidden initial={false} animate={{ scaleY: inc ? 1 : 0 }} transition={SPRING} className="absolute inset-y-3 left-0 w-1 origin-center rounded-r-full bg-accent" />
                <span className={cx('grid size-6 shrink-0 place-items-center rounded-full transition-colors', inc ? 'bg-accent text-on-accent' : 'border border-dashed border-mark text-ink-3')}>{inc ? <Check className="size-3.5" strokeWidth={3} /> : <Lock className="size-3" />}</span>
                <span className={cx('w-24 shrink-0 transition-opacity', !inc && 'opacity-50')}><b className="block text-body font-semibold">{k}</b><span className="text-eyebrow text-ink-3">{ms.length} 家媒体</span></span>
                <span className={cx('min-w-0 flex-1 truncate text-caption transition-opacity', inc ? 'text-ink-2' : 'text-ink-3 opacity-60')}>{inc ? KIND_DESC[k] : '这个方案不含此类'}</span>
                <span className={cx('flex -space-x-2 transition-[opacity,filter]', !inc && 'opacity-40 grayscale')}>
                  {ms.slice(0, 5).map((m, i) => (
                    <motion.span key={m.id + sel.id} initial={inc ? { scale: 0.6, opacity: 0 } : false} animate={{ scale: 1, opacity: 1 }} transition={{ ...SPRING, delay: i * 0.04 }}>
                      <Logo m={m} size="size-8 !rounded-full text-caption ring-2 ring-surface" />
                    </motion.span>
                  ))}
                </span>
              </li>
            )
          })}
        </ul>
        <div className="flex flex-col gap-4 border-t border-line bg-accent-soft/60 p-6 lg:border-l lg:border-t-0">
          <p className="text-caption font-semibold text-accent-ink">{sel.name}</p>
          <p className="flex items-baseline gap-1"><AnimatedNumber value={sel.pts} prefix="⚡" className="text-display font-black leading-none tabular-nums text-accent-ink" /></p>
          <dl className="grid gap-2 text-body">
            <div className="flex justify-between"><dt className="text-ink-2">发布篇数</dt><dd className="font-semibold tabular-nums">{sel.n} 篇</dd></div>
            <div className="flex justify-between"><dt className="text-ink-2">覆盖类别</dt><dd className="font-semibold tabular-nums">{sel.kinds.length} / {KINDS.length} 类</dd></div>
            <div className="flex justify-between"><dt className="text-ink-2">陆续上线</dt><dd className="font-semibold tabular-nums">{sel.days[0]}–{sel.days[1]} 天</dd></div>
            <div className="flex justify-between"><dt className="text-ink-2">单篇均价</dt><dd className="font-semibold tabular-nums">⚡{Math.round(sel.pts / sel.n)}</dd></div>
          </dl>
          <p className="mt-auto flex gap-2 text-caption text-ink-2"><ShieldCheck className="mt-0.5 size-4 shrink-0 text-accent-ink" />我们承诺类别和时间，具体媒体由运维挑选，发布后同步到订单。</p>
        </div>
      </section>
    </div>
  )
}

/** 媒体详情：站在“要不要选它”的角度，把价格、速度、规则、适合做什么讲清 */
export function MediaDetail({ m, selectable, on, toggle, back, open }: { m: Media; selectable: boolean; on: boolean; toggle: () => void; back: () => void; open: (id: string) => void }) {
  const f = KIND_FACTS[m.kind]
  const peers = MEDIA.filter((x) => x.kind === m.kind && x.id !== m.id)
  return (
    <div className="grid gap-5">
      <button onClick={back} className="flex w-fit items-center gap-1.5 text-caption font-semibold text-ink-2 hover:text-ink"><ArrowLeft className="size-4" />返回媒体库</button>
      <section className="grid gap-6 rounded-panel border border-line bg-surface p-6 shadow-soft md:grid-cols-[1fr_auto] md:items-center">
        <div className="flex items-start gap-5">
          <Logo m={m} size="size-20 !rounded-panel !text-h1" />
          <div className="min-w-0">
            <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-eyebrow font-semibold text-accent-ink">{m.kind}</span>
            <h2 className="mt-2 text-h1 font-bold">{m.name}</h2>
            <p className="mt-1 text-body text-ink-2">{m.intro}</p>
          </div>
        </div>
        <div className="grid justify-items-start gap-2 md:justify-items-end">
          {selectable ? (
            <button onClick={toggle} aria-pressed={on} className={cx('flex h-12 items-center gap-2 rounded-full px-7 text-body font-semibold transition-colors', on ? 'border border-accent bg-accent-soft text-accent-ink' : 'bg-accent text-on-accent shadow-lg shadow-accent/30')}>
              {on ? <><Check className="size-4" strokeWidth={3} />已选，点击移除</> : <><Plus className="size-4" />加入精准发布</>}
            </button>
          ) : <p className="max-w-56 text-caption text-ink-3 md:text-right">想只发这一家，请切到“精准发布”。</p>}
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-3">
        {[[Coins, '单篇价格', `⚡${m.pts}`], [Clock, '上线时间', etaText(m.days)], [ShieldCheck, '所属类别', m.kind]].map(([I, l, v]) => {
          const Icon = I as typeof Coins
          return <div key={l as string} className="rounded-panel border border-line bg-surface p-5 shadow-soft"><p className="flex items-center gap-1.5 text-caption text-ink-2"><Icon className="size-4 text-accent-ink" />{l as string}</p><b className="mt-2 block text-h2 font-black tabular-nums text-accent-ink">{v as string}</b></div>
        })}
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <section className="rounded-panel border border-line bg-surface p-6 shadow-soft">
          <h3 className="text-h3 font-bold">适合发什么</h3>
          <p className="mt-2 text-body text-ink-2">{f.fit}</p>
          <p className="mt-3 text-caption text-ink-3">{KIND_DESC[m.kind]}。</p>
        </section>
        <section className="rounded-panel border border-line bg-surface p-6 shadow-soft">
          <h3 className="text-h3 font-bold">发布规则</h3>
          <dl className="mt-2 divide-y divide-line text-body">
            {f.rules.map(([k, v]) => <div key={k} className="flex justify-between gap-4 py-2.5"><dt className="text-ink-2">{k}</dt><dd className="font-semibold">{v}</dd></div>)}
          </dl>
          <p className="mt-1 text-caption text-ink-3">{ETA_DESC}</p>
        </section>
      </div>

      {peers.length > 0 && (
        <section className="rounded-panel border border-line bg-surface p-6 shadow-soft">
          <h3 className="text-h3 font-bold">同类媒体</h3>
          <ul className="mt-3 grid gap-1 sm:grid-cols-2">
            {peers.map((x) => (
              <li key={x.id}><button onClick={() => open(x.id)} className="flex w-full items-center gap-3 rounded-control px-2 py-2 text-left hover:bg-sunken">
                <Logo m={x} size="size-9" /><span className="min-w-0 flex-1"><b className="block truncate text-body font-semibold">{x.name}</b><span className="text-caption text-ink-3">{etaText(x.days)}</span></span>
                <b className="tabular-nums text-accent-ink">⚡{x.pts}</b><ChevronRight className="size-4 text-ink-3" />
              </button></li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
