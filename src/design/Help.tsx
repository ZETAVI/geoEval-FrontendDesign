import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowLeft, ArrowRight, Check, ChevronDown, CircleCheck, Clock, FileText, Headphones, MessageSquarePlus, Paperclip, RotateCcw, Search, Send, ThumbsDown, ThumbsUp, X } from 'lucide-react'
import { FAQ, TICKET_CATS, TICKET_STATUS, orderStats, type Msg, type Ticket } from './data'
import { useFlow } from './flow'
import { EASE, SPRING, rise, stagger } from './motion'
import { cx } from './shared'

const ST_CLS = { open: 'bg-brand-soft text-brand', wait: 'bg-orange-soft text-orange-ink', solved: 'bg-mint-soft text-mint' } as const
const input = 'w-full rounded-control border border-line bg-surface px-3 text-body outline-none transition-shadow focus:border-ink focus:ring-4 focus:ring-accent/20'
const CAT_HINT: Record<string, string> = {
  诊断问题: '排位、采样结果、报告', 文章与内容: '写作、修改、确认', 发布订单: '上线、退回、结算', 充值与发票: '积分、支付、发票', 账号与品牌: '登录、品牌资料', 其他: '以上都不是',
}

/* ── 帮助中心：常见问题 ── */
function Faq({ onDesk }: { onDesk: () => void }) {
  const [q, setQ] = useState('')
  const [group, setGroup] = useState('全部')
  const [open, setOpen] = useState<string | null>(null)
  const groups = FAQ.filter((g) => group === '全部' || g.group === group)
    .map((g) => ({ ...g, items: g.items.filter((i) => !q || i.q.includes(q) || i.a.includes(q)) })).filter((g) => g.items.length)
  return (
    <div className="grid gap-5">
      <label className="relative block">
        <Search className="absolute left-4 top-4 size-4 text-ink-3" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="搜索问题，例如：取消订单、发票" aria-label="搜索常见问题" className={cx(input, 'h-12 rounded-full pl-11 pr-10 shadow-soft')} />
        {q && <button onClick={() => setQ('')} aria-label="清空" className="absolute right-3 top-3 grid size-6 place-items-center rounded-full text-ink-3 hover:bg-sunken"><X className="size-3.5" /></button>}
      </label>
      <div role="tablist" aria-label="问题分类" className="flex flex-wrap gap-1.5">
        {['全部', ...FAQ.map((g) => g.group)].map((g) => (
          <button key={g} role="tab" aria-selected={group === g} onClick={() => setGroup(g)} className={cx('h-8 rounded-full px-3.5 text-caption transition-colors', group === g ? 'bg-ink font-semibold text-surface' : 'bg-sunken text-ink-2 hover:text-ink')}>{g}</button>
        ))}
      </div>
      {groups.map((g) => (
        <section key={g.group} className="rounded-panel border border-line bg-surface px-5 pb-2 pt-4 shadow-soft">
          <h2 className="mb-1 text-eyebrow font-semibold text-ink-3">{g.group}</h2>
          <ul>
            {g.items.map((i) => (
              <li key={i.q} className="border-b border-line last:border-0">
                <button onClick={() => setOpen(open === i.q ? null : i.q)} aria-expanded={open === i.q} className="flex w-full items-center justify-between gap-4 py-3.5 text-left text-body font-semibold">
                  {i.q}<motion.span animate={{ rotate: open === i.q ? 180 : 0 }} transition={SPRING}><ChevronDown className="size-4 text-ink-3" /></motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {open === i.q && <motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: EASE }} className="overflow-hidden pb-4 text-body leading-relaxed text-ink-2">{i.a}</motion.p>}
                </AnimatePresence>
              </li>
            ))}
          </ul>
        </section>
      ))}
      {!groups.length && (
        <div className="grid justify-items-center gap-3 rounded-panel border border-dashed border-mark py-12 text-center">
          <p className="text-body text-ink-2">没有找到“{q}”的相关问题</p>
          <button onClick={onDesk} className="flex h-10 items-center gap-2 rounded-full bg-accent px-5 text-body font-semibold text-on-accent"><MessageSquarePlus className="size-4" />问问客服</button>
        </div>
      )}
    </div>
  )
}

/* ── 联系客服卡 ── */
function Contact({ onNew, onOpen }: { onNew: () => void; onOpen: (id: string) => void }) {
  const { tickets } = useFlow()
  const live = tickets.filter((t) => t.status !== 'solved')
  return (
    <aside className="grid content-start gap-4 lg:sticky lg:top-6">
      <section className="rounded-panel bg-ink p-6 text-surface shadow-raised">
        <span className="grid size-10 place-items-center rounded-full bg-surface/15"><Headphones className="size-5" /></span>
        <h2 className="mt-4 text-h3 font-bold">没找到答案</h2>
        <p className="mt-1 text-caption text-surface/70">提交工单，客服会在这里回复你。</p>
        <button onClick={onNew} className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-surface text-body font-semibold text-ink"><MessageSquarePlus className="size-4" />提交工单</button>
        <dl className="mt-5 grid gap-2 border-t border-surface/15 pt-4 text-caption">
          <div className="flex justify-between"><dt className="text-surface/60">服务时间</dt><dd>工作日 9:00–18:00</dd></div>
          <div className="flex justify-between"><dt className="text-surface/60">通常回复</dt><dd>2 小时内</dd></div>
        </dl>
      </section>
      <section className="rounded-panel border border-line bg-surface p-5 shadow-soft">
        <div className="flex items-baseline justify-between"><h2 className="text-h3 font-bold">进行中的工单</h2><button onClick={() => onOpen('')} className="text-caption text-brand hover:underline">全部</button></div>
        {live.length === 0 ? <p className="mt-3 text-caption text-ink-3">没有进行中的工单。</p> : (
          <ul className="mt-2">
            {live.map((t) => (
              <li key={t.id} className="border-b border-line last:border-0">
                <button onClick={() => onOpen(t.id)} className="flex w-full items-center gap-3 py-3 text-left">
                  <span className="min-w-0 flex-1"><b className="block truncate text-body font-semibold">{t.subject}</b><small className="text-caption text-ink-3">{t.updated}</small></span>
                  <span className={cx('rounded-full px-2.5 py-0.5 text-eyebrow font-semibold', ST_CLS[t.status])}>{TICKET_STATUS[t.status]}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </aside>
  )
}

/* ── 工单工作区：左列表，右对话 ── */
const STEPS = ['已提交', '客服处理', '已解决']
const stepOf = (t: Ticket) => (t.status === 'solved' ? 2 : 1)

function Bubble({ m }: { m: Msg }) {
  if (m.from === 'system') return <li className="flex justify-center py-1"><span className="rounded-full bg-sunken px-3 py-1 text-eyebrow text-ink-3">{m.text} · {m.time}</span></li>
  const me = m.from === 'me'
  return (
    <li className={cx('flex items-end gap-2.5', me && 'flex-row-reverse')}>
      <span className={cx('grid size-8 shrink-0 place-items-center rounded-full text-eyebrow font-bold', me ? 'bg-brand text-on-brand' : 'bg-ink text-surface')}>{me ? '我' : '洞'}</span>
      <div className={cx('grid max-w-[78%] gap-1', me && 'justify-items-end')}>
        <div className={cx('px-4 py-2.5 text-body leading-relaxed', me ? 'rounded-[18px_18px_4px_18px] bg-brand-soft' : 'rounded-[18px_18px_18px_4px] bg-sunken')}>
          {m.text}
          {m.files?.map((f) => <span key={f} className="mt-2 flex w-fit items-center gap-1.5 rounded-control bg-surface px-2.5 py-1 text-caption text-ink-2"><Paperclip className="size-3" />{f}</span>)}
        </div>
        <small className="px-1 text-eyebrow text-ink-3">{me ? '我' : '洞点客服'} · {m.time}</small>
      </div>
    </li>
  )
}

function Thread({ t, back }: { t: Ticket; back: () => void }) {
  const { replyTicket, resolveTicket, orders, go } = useFlow()
  const [text, setText] = useState('')
  const [files, setFiles] = useState<string[]>([])
  const [rated, setRated] = useState<null | boolean>(null)
  const end = useRef<HTMLLIElement>(null)
  useEffect(() => { end.current?.scrollIntoView({ block: 'nearest' }) }, [t.msgs.length, t.id])
  const order = t.related ? orders.find((o) => o.id === t.related) : undefined
  const send = (v = text) => { if (!v.trim()) return; replyTicket(t.id, v.trim(), files.length ? files : undefined); setText(''); setFiles([]) }
  const step = stepOf(t)
  return (
    <div className="flex h-full min-h-[560px] flex-col">
      <header className="border-b border-line p-5">
        <button onClick={back} className="mb-2 flex items-center gap-1 text-caption text-ink-2 hover:text-ink lg:hidden"><ArrowLeft className="size-4" />我的工单</button>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <h2 className="text-h3 font-bold">{t.subject}</h2>
          <span className={cx('rounded-full px-2.5 py-0.5 text-eyebrow font-semibold', ST_CLS[t.status])}>{TICKET_STATUS[t.status]}</span>
          {t.status !== 'solved' && <button onClick={() => resolveTicket(t.id)} className="ml-auto flex h-8 items-center gap-1.5 rounded-full border border-line px-3 text-caption hover:bg-sunken"><CircleCheck className="size-3.5" />已解决</button>}
        </div>
        <p className="mt-1 text-caption text-ink-3">{t.id} · {t.category}</p>
        <ol className="mt-4 flex items-center gap-2 text-caption" aria-label="工单进度">
          {STEPS.map((s, i) => (
            <li key={s} className="flex items-center gap-2">
              <span className={cx('grid size-5 place-items-center rounded-full text-[10px] font-bold', i < step || (i === 2 && step === 2) ? 'bg-mint text-on-brand' : i === step ? 'bg-brand text-on-brand' : 'border border-mark text-ink-3')}>{i < step || (i === 2 && step === 2) ? <Check className="size-3" strokeWidth={3} /> : i + 1}</span>
              <span className={i === step ? 'font-semibold text-ink' : 'text-ink-3'}>{s}</span>
              {i < 2 && <span className={cx('h-px w-8', i < step ? 'bg-mint' : 'bg-line')} />}
            </li>
          ))}
        </ol>
      </header>

      {order && (
        <button onClick={() => go('order', { orderId: order.id })} className="mx-5 mt-4 flex items-center gap-3 rounded-control border border-line bg-sunken/50 px-4 py-3 text-left hover:bg-sunken">
          <span className="grid size-9 place-items-center rounded-control bg-brand-soft text-brand"><FileText className="size-4" /></span>
          <span className="min-w-0 flex-1"><b className="block truncate text-body font-semibold">{order.plan.split(' · ')[0]}</b><small className="text-caption text-ink-3">{order.id} · {orderStats(order).status} · 已上线 {orderStats(order).live} / {orderStats(order).total} 篇</small></span>
          <span className="flex items-center gap-1 text-caption text-brand">查看订单<ArrowRight className="size-3.5" /></span>
        </button>
      )}

      <ul className="grid flex-1 content-start gap-4 overflow-y-auto p-5" aria-live="polite">
        {t.msgs.map((m, i) => <Bubble key={i} m={m} />)}
        <li ref={end} aria-hidden />
      </ul>

      {t.status === 'solved' ? (
        <footer className="grid gap-3 border-t border-line bg-sunken/50 p-5">
          <p className="flex items-center gap-2 text-body font-semibold"><CircleCheck className="size-4 text-mint" />工单已解决</p>
          <div className="flex flex-wrap items-center gap-2 text-caption text-ink-2">
            {rated === null ? <>这次的回复有帮助吗？
              <button onClick={() => setRated(true)} className="flex h-8 items-center gap-1.5 rounded-full border border-line bg-surface px-3 hover:border-ink-3"><ThumbsUp className="size-3.5" />有帮助</button>
              <button onClick={() => setRated(false)} className="flex h-8 items-center gap-1.5 rounded-full border border-line bg-surface px-3 hover:border-ink-3"><ThumbsDown className="size-3.5" />没解决</button></> : <span>谢谢你的反馈。</span>}
            <button onClick={() => send('我还有问题，想重新打开工单')} className="ml-auto flex h-8 items-center gap-1.5 rounded-full px-3 text-brand hover:bg-brand-soft"><RotateCcw className="size-3.5" />重新打开</button>
          </div>
        </footer>
      ) : (
        <footer className="grid gap-3 border-t border-line p-4">
          {t.status === 'wait' && (
            <div className="flex flex-wrap gap-1.5">
              {['我已补充，请继续处理', '请稍后再联系我'].map((q) => <button key={q} onClick={() => send(q)} className="h-7 rounded-full border border-line px-3 text-caption text-ink-2 hover:border-ink-3">{q}</button>)}
            </div>
          )}
          {files.length > 0 && <div className="flex flex-wrap gap-1.5">{files.map((f) => <span key={f} className="flex items-center gap-1.5 rounded-full bg-sunken px-2.5 py-1 text-caption"><Paperclip className="size-3" />{f}<button onClick={() => setFiles(files.filter((x) => x !== f))} aria-label="移除"><X className="size-3" /></button></span>)}</div>}
          <div className="flex items-end gap-2 rounded-[20px] border border-line bg-surface p-2 focus-within:border-ink focus-within:ring-4 focus-within:ring-accent/20">
            <button onClick={() => setFiles([...files, `截图-${files.length + 1}.png`])} aria-label="添加截图" className="grid size-9 shrink-0 place-items-center rounded-full text-ink-2 hover:bg-sunken"><Paperclip className="size-4" /></button>
            <textarea value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); send() } }} rows={1} maxLength={500} placeholder="回复客服，Enter 发送，Shift+Enter 换行" aria-label="回复"
              className="max-h-32 min-h-9 flex-1 resize-none bg-transparent py-1.5 text-body outline-none" />
            <button onClick={() => send()} disabled={!text.trim()} aria-label="发送" className="grid size-9 shrink-0 place-items-center rounded-full bg-accent text-on-accent disabled:opacity-40"><Send className="size-4" /></button>
          </div>
        </footer>
      )}
    </div>
  )
}

function Compose({ onDone, relatedInit }: { onDone: (id?: string) => void; relatedInit?: string }) {
  const { addTicket, orders } = useFlow()
  const [cat, setCat] = useState<string>(relatedInit ? '发布订单' : TICKET_CATS[0])
  const [rel, setRel] = useState(relatedInit ?? '')
  const [subject, setSubject] = useState('')
  const [text, setText] = useState('')
  const [files, setFiles] = useState<string[]>([])
  const ok = subject.trim().length >= 4 && text.trim().length >= 10
  const submit = () => {
    const id = `T-${1043 + Math.floor(Math.random() * 900)}`
    addTicket({ id, subject: subject.trim(), category: cat, status: 'open', updated: '刚刚', related: rel || undefined, msgs: [
      { from: 'system', text: `工单已创建${rel ? `，已关联订单 ${rel}` : ''}`, time: '刚刚' },
      { from: 'me', text: text.trim(), time: '刚刚', files: files.length ? files : undefined },
    ] })
    onDone(id)
  }
  return (
    <div className="grid content-start gap-6 p-6">
      <div className="flex items-start gap-3">
        <button onClick={() => onDone()} aria-label="返回" className="grid size-9 place-items-center rounded-full hover:bg-sunken lg:hidden"><ArrowLeft className="size-4" /></button>
        <div><h2 className="text-h2 font-bold">提交工单</h2><p className="text-caption text-ink-2">写清楚发生了什么，客服不需要再追问。</p></div>
      </div>
      <div><p className="mb-2 text-body font-semibold">问题类型</p>
        <div role="radiogroup" aria-label="问题类型" className="grid grid-cols-2 gap-2 md:grid-cols-3">
          {TICKET_CATS.map((c) => <button key={c} role="radio" aria-checked={cat === c} onClick={() => setCat(c)} className={cx('rounded-control border px-3.5 py-2.5 text-left transition-colors', cat === c ? 'border-accent bg-accent-soft' : 'border-line hover:border-ink-3')}><b className="block text-body font-semibold">{c}</b><small className="text-caption text-ink-2">{CAT_HINT[c]}</small></button>)}
        </div>
      </div>
      {orders.length > 0 && (cat === '发布订单' || rel) && (
        <div><p className="mb-2 text-body font-semibold">关联订单 <span className="ml-1 text-eyebrow font-normal text-ink-3">选填</span></p>
          <div className="grid gap-2">
            {orders.map((o) => (
              <button key={o.id} onClick={() => setRel(rel === o.id ? '' : o.id)} aria-pressed={rel === o.id} className={cx('flex items-center gap-3 rounded-control border px-3.5 py-2.5 text-left transition-colors', rel === o.id ? 'border-accent bg-accent-soft' : 'border-line hover:border-ink-3')}>
                <span className="min-w-0 flex-1"><b className="block truncate text-body font-semibold">{o.plan.split(' · ')[0]}</b><small className="text-caption text-ink-3">{o.id} · {orderStats(o).status}</small></span>
                {rel === o.id && <Check className="size-4 text-accent" strokeWidth={3} />}
              </button>
            ))}
          </div>
        </div>
      )}
      <label className="grid gap-2 text-body font-semibold">标题<input value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={40} placeholder="一句话说明问题" className={cx(input, 'h-11 font-normal')} /></label>
      <label className="grid gap-2 text-body font-semibold">问题描述
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={5} maxLength={500} placeholder="发生了什么、在哪一步、希望怎么处理" className={cx(input, 'resize-none py-2.5 font-normal')} />
        <span className="text-right text-eyebrow font-normal tabular-nums text-ink-3">{text.length}/500</span>
      </label>
      <div className="flex flex-wrap items-center gap-2">
        <button onClick={() => setFiles([...files, `截图-${files.length + 1}.png`])} className="flex h-10 items-center gap-2 rounded-full border border-dashed border-mark px-4 text-caption text-ink-2 hover:border-ink-3"><Paperclip className="size-4" />添加截图</button>
        {files.map((f) => <span key={f} className="flex items-center gap-1.5 rounded-full bg-sunken px-2.5 py-1 text-caption">{f}<button onClick={() => setFiles(files.filter((x) => x !== f))} aria-label="移除"><X className="size-3" /></button></span>)}
        <div className="ml-auto flex gap-2"><button onClick={() => onDone()} className="h-11 rounded-full border border-line px-5 text-body">取消</button><button disabled={!ok} onClick={submit} className="h-11 rounded-full bg-accent px-6 text-body font-semibold text-on-accent disabled:opacity-40">提交</button></div>
      </div>
    </div>
  )
}

function Desk({ sel, setSel, relatedInit, exit }: { sel: string; setSel: (v: string) => void; relatedInit?: string; exit: () => void }) {
  const { tickets } = useFlow()
  const [f, setF] = useState<'all' | Ticket['status']>('all')
  const list = tickets.filter((t) => f === 'all' || t.status === f)
  const cur = tickets.find((t) => t.id === sel)
  const showRight = sel === 'new' || !!cur
  return (
    <div className="grid overflow-hidden rounded-panel border border-line bg-surface shadow-soft lg:grid-cols-[340px_1fr]">
      <div className={cx('border-line lg:border-r', showRight && 'hidden lg:block')}>
        <div className="flex items-center gap-2 border-b border-line p-4">
          <button onClick={exit} aria-label="返回帮助中心" className="grid size-8 place-items-center rounded-full hover:bg-sunken"><ArrowLeft className="size-4" /></button>
          <h2 className="text-h3 font-bold">我的工单</h2>
          <button onClick={() => setSel('new')} aria-label="提交工单" className="ml-auto grid size-8 place-items-center rounded-full bg-accent text-on-accent"><MessageSquarePlus className="size-4" /></button>
        </div>
        <div className="flex flex-wrap gap-1.5 border-b border-line px-4 py-3">
          {([['all', '全部'], ['wait', '待你回复'], ['open', '处理中'], ['solved', '已解决']] as const).map(([k, l]) => (
            <button key={k} aria-pressed={f === k} onClick={() => setF(k)} className={cx('h-7 rounded-full px-3 text-caption', f === k ? 'bg-ink font-semibold text-surface' : 'bg-sunken text-ink-2')}>{l}</button>
          ))}
        </div>
        <ul>
          {list.map((t) => (
            <li key={t.id}>
              <button onClick={() => setSel(t.id)} aria-current={sel === t.id} className={cx('grid w-full gap-1 border-b border-l-2 border-b-line px-4 py-3.5 text-left transition-colors', sel === t.id ? 'border-l-accent bg-accent-soft/60' : 'border-l-transparent hover:bg-sunken/60')}>
                <span className="flex items-center gap-2"><b className="min-w-0 flex-1 truncate text-body font-semibold">{t.subject}</b>{t.status === 'wait' && <i className="size-2 shrink-0 rounded-full bg-orange" />}</span>
                <span className="truncate text-caption text-ink-2">{t.msgs.filter((m) => m.from !== 'system').at(-1)?.text}</span>
                <span className="flex items-center gap-2 text-eyebrow text-ink-3"><span className={cx('rounded-full px-2 py-0.5 font-semibold', ST_CLS[t.status])}>{TICKET_STATUS[t.status]}</span>{t.category}<span className="ml-auto flex items-center gap-1"><Clock className="size-3" />{t.updated}</span></span>
              </button>
            </li>
          ))}
          {!list.length && <li className="px-4 py-10 text-center text-caption text-ink-3">没有这个状态的工单。</li>}
        </ul>
      </div>
      <div className={cx('min-w-0', !showRight && 'hidden lg:block')}>
        {sel === 'new' ? <Compose relatedInit={relatedInit} onDone={(id) => setSel(id ?? '')} />
          : cur ? <Thread t={cur} back={() => setSel('')} />
          : <div className="grid h-full min-h-[420px] place-content-center justify-items-center gap-3 p-10 text-center"><span className="grid size-12 place-items-center rounded-full bg-sunken text-ink-3"><Headphones className="size-5" /></span><p className="text-body text-ink-2">选择左侧工单查看对话</p><button onClick={() => setSel('new')} className="h-10 rounded-full bg-accent px-5 text-body font-semibold text-on-accent">提交工单</button></div>}
      </div>
    </div>
  )
}

export function Help() {
  const { params, tickets } = useFlow()
  const deskInit = !!(params.compose || params.ticketId)
  const [desk, setDesk] = useState(deskInit)
  const [sel, setSel] = useState<string>(params.compose ? 'new' : params.ticketId ?? (tickets[0]?.id ?? ''))
  const openDesk = (id: string) => { setSel(id); setDesk(true) }
  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="px-5 py-8 md:px-10">
      <motion.header variants={rise} className="mb-6">
        <h1 className="text-h1 font-black">帮助与客服</h1>
        <p className="mt-1 text-body text-ink-2">{desk ? '和客服的所有对话都在这里。' : '先查常见问题，没有答案再联系客服。'}</p>
      </motion.header>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={desk ? 'desk' : 'home'} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.22, ease: EASE }}>
          {desk ? <Desk sel={sel} setSel={setSel} relatedInit={params.orderId} exit={() => setDesk(false)} />
            : <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]"><Faq onDesk={() => openDesk('new')} /><Contact onNew={() => openDesk('new')} onOpen={(id) => openDesk(id || tickets[0]?.id || '')} /></div>}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
}
