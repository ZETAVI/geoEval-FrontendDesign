import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ChevronDown, Info, MessageSquareQuote, RotateCcw } from 'lucide-react'
import { KIND_LABEL, PLATFORM_NAMES, QUESTIONS, SAMPLES, TIER, answerList, bestRank, questionHits, tierOf } from './diag'
import { EASE, SPRING } from './motion'
import { cx } from './shared'

export type Sel = [number, number]

const COL = ['col-start-1', 'col-start-2', 'col-start-3', 'col-start-4', 'col-start-5', 'col-start-6', 'col-start-7', 'col-start-8', 'col-start-9', 'col-start-10', 'col-start-11', 'col-start-12']
const MAX_RANK = 8

/** 排位图：横轴 = 品牌在 AI 回答里的排位，越靠左越先被提到；右侧虚线区 = 没被提到 */
function Lanes({ sel, onSel, focusQ, run }: { sel: Sel; onSel: (v: Sel) => void; focusQ: number | null; run: number }) {
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[640px]">
        <div className="grid grid-cols-[6rem_1fr_5.5rem] text-eyebrow text-ink-3">
          <span />
          <div className="grid grid-cols-12">
            <span className="col-span-3 pb-1 text-center font-semibold text-orange-ink">靠前</span>
            <span className="col-span-5 pb-1 text-center">靠后</span>
            <span className="col-span-4 pb-1 text-center">未提及</span>
            {Array.from({ length: MAX_RANK }, (_, i) => <span key={i} className="pb-1 text-center tabular-nums">第{i + 1}位</span>)}
            <span className="col-span-4" />
          </div>
          <span />
        </div>
        <div key={run}>
          {SAMPLES.map((row, p) => {
            const best = bestRank(p)
            const n = row.filter((x) => x.rank != null).length
            return (
              <div key={p} className="grid grid-cols-[6rem_1fr_5.5rem] items-center border-t border-line/70">
                <b className="text-body">{PLATFORM_NAMES[p]}</b>
                <div className="grid h-16 grid-cols-12 items-center">
                  <span className="col-span-3 col-start-1 row-start-1 h-full bg-orange-soft/60" />
                  <span className="col-span-4 col-start-9 row-start-1 h-full border-l border-dashed border-mark bg-sunken/70" />
                  {row.map((x, q) => {
                    const t = tierOf(x.rank)
                    const on = sel[0] === p && sel[1] === q
                    const dim = focusQ != null && focusQ !== q
                    return (
                      <motion.button
                        key={q}
                        initial={{ opacity: 0, scale: 0.4 }}
                        animate={{ opacity: dim ? 0.25 : 1, scale: 1 }}
                        transition={{ delay: 0.1 + (p * 4 + q) * 0.04, type: 'spring', stiffness: 380, damping: 22 }}
                        whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.94 }}
                        onClick={() => onSel([p, q])}
                        aria-pressed={on}
                        aria-label={`${PLATFORM_NAMES[p]}，问题 ${q + 1}：${x.rank ? `第 ${x.rank} 位，${TIER[t].label}` : '未提及'}`}
                        title={`Q${q + 1} · ${x.rank ? `第 ${x.rank} 位` : '未提及'}`}
                        className={cx('relative row-start-1 grid size-9 place-self-center place-items-center rounded-full text-eyebrow font-bold outline-offset-4 focus-visible:outline-2 focus-visible:outline-brand', COL[x.rank ? x.rank - 1 : 8 + q], TIER[t].cell)}
                      >
                        Q{q + 1}
                        {on && <motion.span layoutId="dot-sel" transition={SPRING} className="absolute -inset-1.5 rounded-full ring-2 ring-ink" />}
                      </motion.button>
                    )
                  })}
                </div>
                <span className="pl-3 text-caption leading-snug text-ink-2">
                  {n ? <><b className="text-ink">提到 {n} 次</b><br />最佳第 {best} 位</> : '一次都没提到'}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/** 一条回答：品牌列表原文，你的那一行高亮；默认只露出前三家和你 */
function Evidence({ sel }: { sel: Sel }) {
  const [full, setFull] = useState(false)
  const smp = SAMPLES[sel[0]][sel[1]]
  const t = tierOf(smp.rank)
  const list = answerList(smp)
  const rows: ({ kind: 'item'; i: number } | { kind: 'gap'; n: number })[] = []
  let skipped = 0
  list.forEach((it, i) => {
    if (full || i < 3 || it.me) {
      if (skipped) rows.push({ kind: 'gap', n: skipped })
      skipped = 0
      rows.push({ kind: 'item', i })
    } else skipped++
  })
  if (skipped) rows.push({ kind: 'gap', n: skipped })
  const ahead = list.slice(0, (smp.rank ?? 1) - 1).map((x) => x.name)

  return (
    <AnimatePresence mode="wait">
      <motion.section key={sel.join()} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25, ease: EASE }}
        className="grid gap-6 rounded-panel border border-line bg-surface p-6 shadow-soft lg:grid-cols-[1.4fr_1fr]" aria-live="polite">
        <div className="grid content-start gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <MessageSquareQuote className="size-4 text-brand" />
            <b className="text-h3">{PLATFORM_NAMES[sel[0]]} 的回答</b>
            <span className="rounded-full bg-brand-soft px-2 py-0.5 text-eyebrow font-semibold text-brand">Q{sel[1] + 1}</span>
          </div>
          <p className="rounded-control bg-sunken px-3 py-2 text-caption text-ink-2">{QUESTIONS[sel[1]].text}</p>
          <ol className="grid gap-1.5 text-body">
            {rows.map((r, k) => r.kind === 'gap' ? (
              <li key={`g${k}`} className="pl-2 text-caption text-ink-3">… 省略 {r.n} 家</li>
            ) : (
              <li key={r.i} className={cx('rounded-control px-2 py-1', list[r.i].me && 'bg-orange-soft text-orange-ink')}>
                {r.i + 1}. <b className={list[r.i].me ? 'font-bold' : 'font-semibold'}>{list[r.i].name}</b>{list[r.i].note && `：${list[r.i].note}`}
              </li>
            ))}
          </ol>
          {list.length > 4 && (
            <button onClick={() => setFull((f) => !f)} aria-expanded={full} className="flex w-fit items-center gap-1 text-caption font-semibold text-brand">
              {full ? '收起回答' : `展开全部 ${list.length} 家`}
              <ChevronDown className={cx('size-3.5 transition-transform', full && 'rotate-180')} />
            </button>
          )}
        </div>

        <div className="grid content-start gap-4 border-t border-line pt-5 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
          <p className="text-caption text-ink-2">你在这条回答里的位置</p>
          <div>
            <p className="flex items-baseline gap-2">
              {smp.rank ? <><span className="text-h1 font-black tabular-nums">第 {smp.rank} 位</span><span className="text-caption text-ink-2">共列出 {smp.total} 家</span></> : <span className="text-h1 font-black text-ink-3">没有被提到</span>}
            </p>
            <span className={cx('mt-2 inline-block rounded-full px-2.5 py-0.5 text-eyebrow font-semibold', TIER[t].chip)}>{TIER[t].label}</span>
            <p className="mt-1 text-caption text-ink-2">{TIER[t].hint}</p>
          </div>
          <ol className="flex flex-wrap gap-1" aria-hidden>
            {list.map((it, i) => (
              <motion.li key={i} initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ delay: i * 0.04 }} className={cx('h-2.5 w-6 origin-bottom rounded-full', it.me ? 'bg-orange' : 'bg-mark')} />
            ))}
          </ol>
          {ahead.length > 0 && <p className="text-caption text-ink-2">排在你前面：<b className="text-ink">{ahead.join('、')}</b></p>}
          {!smp.rank && <p className="text-caption text-ink-2">这些品牌占了用户能看到的位置，就是你在这个问题上的对手。</p>}
        </div>
        <p className="flex gap-1.5 text-caption text-ink-3 lg:col-span-2"><Info className="mt-0.5 size-3.5 shrink-0" />排位反映本次采样中 AI 的回答，不代表长期或保证性结果。</p>
      </motion.section>
    </AnimatePresence>
  )
}

/** 平台排位：左侧问题列表（全文）+ 排位图 + 单条回答 */
export function PositionMap({ sel, setSel, focusQ, setFocusQ }: { sel: Sel; setSel: (v: Sel) => void; focusQ: number | null; setFocusQ: (q: number | null) => void }) {
  const [run, setRun] = useState(0)
  return (
    <div className="grid gap-4">
      <div className="grid gap-5 rounded-panel border border-line bg-surface p-5 shadow-soft lg:grid-cols-[17rem_1fr] lg:p-6">
        <div>
          <h3 className="text-h2 font-bold">4 个问题</h3>
          <p className="mb-3 text-caption text-ink-2">点一个问题，只看它的结果</p>
          <ul className="grid gap-2">
            {QUESTIONS.map((q, i) => {
              const on = focusQ === i
              return (
                <li key={i}>
                  <button onClick={() => setFocusQ(on ? null : i)} aria-pressed={on}
                    className={cx('grid w-full gap-1 rounded-control border p-3 text-left transition-colors', on ? 'border-brand bg-brand-soft' : 'border-line hover:bg-sunken')}>
                    <span className="flex items-center gap-2 text-eyebrow">
                      <b className="text-brand">Q{i + 1}</b>
                      <span className="rounded-full bg-sunken px-1.5 py-0.5 text-ink-2">{KIND_LABEL[q.kind]}</span>
                      <span className="ml-auto tabular-nums text-ink-2">{questionHits(i)} / 5 提到你</span>
                    </span>
                    <span className="text-body leading-snug">{q.text}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
        <div>
          <div className="mb-2 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-h2 font-bold">平台排位</h3>
              <p className="text-caption text-ink-2">越靠左，AI 越先提到你</p>
            </div>
            <button onClick={() => setRun((n) => n + 1)} className="flex items-center gap-1 rounded-full border border-line px-3 py-1 text-caption text-ink-2 hover:bg-sunken">
              <RotateCcw className="size-3" />回放诊断
            </button>
          </div>
          <Lanes sel={sel} onSel={setSel} focusQ={focusQ} run={run} />
          <ul className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-eyebrow text-ink-2">
            {(['top', 'mid', 'low', 'none'] as const).map((t) => (
              <li key={t} className="flex items-center gap-1.5"><span className={cx('size-3.5 rounded-full', TIER[t].cell)} />{TIER[t].label}</li>
            ))}
            <li className="text-ink-3">点圆点看原始回答</li>
          </ul>
        </div>
      </div>
      <Evidence sel={sel} />
    </div>
  )
}
