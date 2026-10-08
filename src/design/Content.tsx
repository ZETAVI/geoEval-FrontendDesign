import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowRight, Check, Link2, Loader2, PenLine, Plus, RefreshCw, Sparkles, TriangleAlert } from 'lucide-react'
import { BRAND } from './diag'
import { useFlow, type Article, type Source } from './flow'
import { EASE, SPRING, rise, stagger } from './motion'
import { cx } from './shared'
import { ModuleShell } from './ui'
import { Chip, TextField } from './kit'
import { ProfileTab } from './Profile'
import { checklist, facts, missingMust, priceText } from './profile'
import { RichEditor, toHtml } from './Editor'

const STEPS = ['选风格', '改草稿', '确认'] as const
const WAIT = ['读取品牌资料…', '对照诊断缺口…', '搭建文章结构…', '润色语句…']
export type Style = { angle: string; readers: string[]; focus: string; tone: string; structure: string; titleStyle: string; length: string; avoid: string[] }
const compose = (area: string, price: string, who: string[], st: Style) => {
  const t = BRAND
  const titles: Record<string, string> = {
    陈述式: `${t}：把每一次上门服务讲清楚`,
    提问式: `${t}怎么收费、怎么服务？`,
    数字式: `选${t}的 4 个理由`,
    场景式: `周末想把家收拾干净，${t}怎么帮你？`,
  }
  const title = st.angle === '价格说明' && st.titleStyle === '陈述式' ? `${t}的价格是怎么算的` : titles[st.titleStyle] ?? titles.陈述式
  const noPrice = st.avoid.includes('不披露价格')
  const body = [
    title,
    st.tone === '口语化' ? `很多家庭第一次找家政都会犹豫。${t}成立于 2016 年，专注上海本地的家庭保洁与保姆服务，下面把大家常问的讲清楚。` : `${t}成立于 2016 年，专注上海本地的家庭保洁与保姆服务。每一次上门前，我们会和你确认服务清单与时间；上门后，阿姨按清单逐项完成，结束时与你一起验收。`,
    st.focus.trim() ? `本文重点：${st.focus.trim()}。` : '',
    `服务区域：${area || '浦东新区、徐汇区、闵行区、长宁区，其他区域可预约咨询'}。`,
    `服务项目：日常保洁、深度保洁、保姆与钟点工、月嫂与母婴护理、老人陪护。${noPrice ? '' : price ? `参考价格：${price}。` : '具体价格按面积和时长报价，上门前确认。'}`,
    (st.readers.length ? st.readers : who).length ? `我们更常服务的是：${(st.readers.length ? st.readers : who).join('、')}。` : '',
    st.length === '短' ? '' : '阿姨上岗前都经过 40 学时的培训与考核，深度保洁、母婴护理、老人陪护各有固定的操作流程，服务结束后 3 天内有回访。',
    st.length === '长' ? '如果你第一次预约，可以先从一次日常保洁开始，满意后再选择长期服务。' : '',
  ].filter(Boolean).join('\n\n')
  return { title, body }
}

function Stepper({ at }: { at: number }) {
  return (
    <ol className="flex items-center gap-2 text-caption" aria-label="文章进度">
      {STEPS.map((s, i) => (
        <li key={s} aria-current={i === at ? 'step' : undefined} className="flex items-center gap-2">
          <span className={cx('grid size-6 place-items-center rounded-full text-eyebrow font-bold transition-colors', i < at ? 'bg-accent text-on-accent' : i === at ? 'bg-accent-soft text-accent-ink ring-2 ring-accent' : 'border border-dashed border-mark text-ink-3')}>
            {i < at ? <Check className="size-3" strokeWidth={3} /> : i + 1}
          </span>
          <span className={cx(i === at ? 'font-semibold text-accent-ink' : 'text-ink-3')}>{s}</span>
          {i < STEPS.length - 1 && <span className="mx-1 h-px w-8 bg-line" />}
        </li>
      ))}
    </ol>
  )
}

/** 就地确认：破坏性动作用小浮层说清后果，比弹窗轻 */
function Confirm({ open, text, ok, onOk, onCancel, end }: { end?: boolean; open: boolean; text: string; ok: string; onOk: () => void; onCancel: () => void }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div role="alertdialog" aria-label={text} initial={{ opacity: 0, y: 6, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 4 }} transition={{ duration: 0.2, ease: EASE }}
          className={cx('absolute bottom-full z-20 mb-2 w-72 rounded-control border border-line bg-surface p-4 shadow-raised', end ? 'right-0' : 'left-0')}>
          <p className="flex gap-2 text-body"><TriangleAlert className="mt-0.5 size-4 shrink-0 text-orange-ink" />{text}</p>
          <div className="mt-3 flex justify-end gap-2 text-caption">
            <button onClick={onCancel} className="h-8 rounded-full px-3 hover:bg-sunken">取消</button>
            <button onClick={onOk} className="h-8 rounded-full bg-accent px-3 font-semibold text-on-accent">{ok}</button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function Panel({ title, children, className }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <section className={cx('rounded-panel border border-line bg-surface p-6 shadow-soft', className)}>
      {title && <h2 className="mb-4 text-h3 font-bold">{title}</h2>}
      {children}
    </section>
  )
}

const input = 'h-11 w-full rounded-control border border-line bg-surface px-3 text-body outline-none transition-shadow focus:border-ink focus:ring-4 focus:ring-accent/20'

/* ── 第 1 步：选风格 ── */
const ANGLES: [string, string][] = [
  ['品牌介绍', '说明定位与核心业务'], ['服务流程', '按步骤说明如何交付'], ['价格说明', '公开计价方式与影响因素'],
  ['选购指南', '列出选择服务的标准'], ['常见问答', '逐条回应高频疑问'], ['客户案例', '以真实服务过程佐证'],
]
const READERS = ['双职工家庭', '有新生儿的家庭', '老人子女', '租房白领', '企业办公室']
const FOCUS = ['服务区域', '价格区间', '上门流程', '培训与资质', '售后保障', '新店或活动']
const TONES: [string, string][] = [['专业严谨', '表述客观，有据可依'], ['亲切自然', '第二人称，通俗易懂'], ['口语化', '日常用语，对话式'], ['简明直接', '结论先行，少用修辞']]
const STRUCTS = ['概述式', '问答式', '清单式', '步骤式']
const TITLES: [string, string][] = [['陈述式', '直接点明主题与品牌'], ['提问式', '对应用户的搜索问句'], ['数字式', '以数量归纳要点'], ['场景式', '从具体使用场景切入']]
const AVOID = ['不使用绝对化用语', '不引用未经证实的数据', '不涉及竞品比较', '不披露价格']
const LENGTHS = ['短', '中', '长']
const LEN_HINT: Record<string, string> = { 短: '300 字左右', 中: '600 字左右', 长: '1000 字左右' }

function Pick({ label, value, options, onChange, hint }: { label: string; value: string; options: string[]; onChange: (v: string) => void; hint?: (o: string) => string | undefined }) {
  return (
    <div>
      <p className="mb-2 text-body font-semibold">{label}</p>
      <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2">
        {options.map((o) => (
          <Chip key={o} role="radio" on={value === o} onClick={() => onChange(o)}>{o}{hint?.(o) && <span className="text-caption font-normal opacity-70">{hint(o)}</span>}</Chip>
        ))}
      </div>
    </div>
  )
}

function Brief({ source, onDone }: { source?: Source; onDone: (a: Article) => void }) {
  const { profile, go } = useFlow()
  const [st, setSt] = useState<Style>({ angle: '品牌介绍', readers: [], focus: source ? `补全${source.gap}` : '', tone: '专业严谨', structure: '概述式', titleStyle: '陈述式', length: '中', avoid: [] })
  const set = (v: Partial<Style>) => setSt((x) => ({ ...x, ...v }))
  const [phase, setPhase] = useState<'idle' | 'busy' | 'fail'>('idle')
  const [w, setW] = useState(0)
  const [failNext, setFailNext] = useState(false)
  const miss = facts(profile).filter((f) => !f.value)
  useEffect(() => {
    if (phase !== 'busy') return
    const t = setInterval(() => setW((v) => Math.min(v + 1, WAIT.length - 1)), 700)
    const done = setTimeout(() => {
      if (failNext) { setPhase('fail'); setFailNext(false); return }
      const { title, body } = compose(profile.address.replace(/^上海市/, ''), priceText(profile), profile.customers, st)
      onDone({ title, body, html: toHtml(body), status: 'draft', source })
    }, 2900)
    return () => { clearInterval(t); clearTimeout(done) }
  }, [phase]) // eslint-disable-line react-hooks/exhaustive-deps
  const start = () => { setW(0); setPhase('busy') }
  return (
    <div className="grid items-start gap-4 lg:grid-cols-[1fr_300px]">
      <div className="grid gap-4">
        <Panel title="写作设置">
          {source && <p className="-mt-2 mb-4 flex w-fit items-center gap-2 rounded-full bg-accent-soft px-3 py-1.5 text-caption"><Link2 className="size-3.5" />来自诊断：{source.q} · {source.platform} · {source.gap}没有说清</p>}
          <div className="grid gap-6">
            <div>
              <p className="mb-2 text-body font-semibold">选题角度</p>
              <div role="radiogroup" aria-label="选题角度" className="grid grid-cols-2 gap-2 md:grid-cols-3">
                {ANGLES.map(([k, d]) => (
                  <button key={k} role="radio" aria-checked={st.angle === k} onClick={() => set({ angle: k })}
                    className={cx('rounded-control border px-3.5 py-2.5 text-left transition-colors', st.angle === k ? 'border-accent bg-accent-soft' : 'border-line hover:border-ink-3')}>
                    <b className="block text-body font-semibold">{k}</b><small className="text-caption text-ink-2">{d}</small>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-body font-semibold">目标读者 <span className="ml-1 text-eyebrow font-normal text-ink-3">可多选；不选则用品牌资料里的目标客户</span></p>
              <div role="group" aria-label="读者" className="flex flex-wrap gap-2">
                {READERS.map((g) => {
                  const on = st.readers.includes(g)
                  return <button key={g} aria-pressed={on} onClick={() => set({ readers: on ? st.readers.filter((x) => x !== g) : [...st.readers, g] })}
                    className={cx('flex h-10 items-center gap-1.5 rounded-full border px-4 text-body transition-colors', on ? 'border-accent bg-accent-soft font-semibold' : 'border-line hover:border-ink-3')}>{on && <Check className="size-3.5" strokeWidth={3} />}{g}</button>
                })}
              </div>
            </div>
            <div>
              <p className="mb-2 text-body font-semibold">这篇要强调什么 <span className="ml-1 text-eyebrow font-normal text-ink-3">点选或自己写，AI 会围绕它展开</span></p>
              <div role="group" aria-label="写作重点" className="mb-2 flex flex-wrap gap-1.5">
                {FOCUS.map((g) => {
                  const on = st.focus.includes(g)
                  return <Chip key={g} size="sm" on={on} onClick={() => set({ focus: on ? st.focus.replace(new RegExp(`(、|^)${g}`), '').replace(/^、/, '') : st.focus ? `${st.focus}、${g}` : g })}>{g}</Chip>
                })}
              </div>
              <TextField multiline rows={2} max={120} value={st.focus} onChange={(focus) => set({ focus })} label="写作重点" placeholder="例：补充闵行区的服务范围，说明新开莘庄店" />
            </div>
            <div className="grid gap-x-8 gap-y-6 md:grid-cols-2">
              <div>
                <p className="mb-2 text-body font-semibold">文风</p>
                <div role="radiogroup" aria-label="文风" className="grid gap-1.5">
                  {TONES.map(([k, d]) => <button key={k} role="radio" aria-checked={st.tone === k} onClick={() => set({ tone: k })} className={cx('flex items-baseline justify-between rounded-control border px-3.5 py-2 text-body transition-colors', st.tone === k ? 'border-accent bg-accent-soft font-semibold' : 'border-line hover:border-ink-3')}>{k}<small className="text-caption font-normal text-ink-3">{d}</small></button>)}
                </div>
              </div>
              <div>
                <p className="mb-2 text-body font-semibold">标题类型</p>
                <div role="radiogroup" aria-label="标题类型" className="grid gap-1.5">
                  {TITLES.map(([k, d]) => <button key={k} role="radio" aria-checked={st.titleStyle === k} onClick={() => set({ titleStyle: k })} className={cx('flex items-baseline justify-between rounded-control border px-3.5 py-2 text-body transition-colors', st.titleStyle === k ? 'border-accent bg-accent-soft font-semibold' : 'border-line hover:border-ink-3')}>{k}<small className="text-caption font-normal text-ink-3">{d}</small></button>)}
                </div>
              </div>
            </div>
            <Pick label="文章结构" value={st.structure} options={STRUCTS} onChange={(structure) => set({ structure })} />
            <Pick label="篇幅" value={st.length} options={LENGTHS} onChange={(length) => set({ length })} hint={(o) => LEN_HINT[o]} />
            <div>
              <p className="mb-2 text-body font-semibold">不要出现 <span className="ml-1 text-eyebrow font-normal text-ink-3">选填，勾选的内容文章里不会写</span></p>
              <div role="group" aria-label="内容规范" className="flex flex-wrap gap-2">
                {AVOID.map((g) => {
                  const on = st.avoid.includes(g)
                  return <Chip key={g} size="sm" on={on} onClick={() => set({ avoid: on ? st.avoid.filter((x) => x !== g) : [...st.avoid, g] })}>{g}</Chip>
                })}
              </div>
            </div>
          </div>
        </Panel>

        <AnimatePresence>
          {phase === 'fail' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} role="alert" className="flex flex-wrap items-center gap-3 rounded-control border border-danger/40 bg-danger-soft px-4 py-3">
              <TriangleAlert className="size-4 text-danger" />
              <div className="flex-1"><p className="text-body font-semibold">生成失败</p><p className="text-caption text-ink-2">写作设置已保留，没有扣积分。</p></div>
              <button onClick={start} className="h-9 rounded-full bg-accent px-4 text-caption font-semibold text-on-accent">再试一次</button>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="flex flex-wrap items-center gap-4">
          <motion.button whileTap={{ scale: 0.97 }} onClick={start} disabled={phase === 'busy'}
            className="relative flex h-12 min-w-44 items-center justify-center gap-2 overflow-hidden rounded-full bg-accent px-7 text-body font-semibold text-on-accent shadow-lg shadow-accent/30 disabled:cursor-wait">
            {phase === 'busy' ? (
              <><Loader2 className="size-4 animate-spin" /><AnimatePresence mode="wait"><motion.span key={w} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>{WAIT[w]}</motion.span></AnimatePresence></>
            ) : <><Sparkles className="size-4" />生成草稿</>}
          </motion.button>
          <span className="text-caption text-ink-2">约 30 秒</span>
          <button onClick={() => setFailNext(true)} className={cx('ml-auto text-eyebrow', failNext ? 'text-danger' : 'text-ink-3 hover:text-ink-2')}>{failNext ? '下一次将模拟失败' : '演示：模拟失败'}</button>
        </div>
      </div>

      <Panel title="引用的资料" className="lg:sticky lg:top-6">
        <p className="-mt-2 mb-3 text-caption text-ink-2">写作时会直接引用这些资料。</p>
        <p className="text-h2 font-black tabular-nums">{7 - miss.length}<span className="text-body font-normal text-ink-3"> / 7 项已填</span></p>
        {miss.length > 0 && <ul className="mt-3 grid gap-1.5">{miss.map((f) => <li key={f.key} className="flex items-center justify-between text-body"><span className="text-ink-2">{f.label}</span><button onClick={() => go('content', { tab: 'profile', focusField: f.anchor })} className="text-caption font-semibold underline underline-offset-4">去补充</button></li>)}</ul>}
      </Panel>
    </div>
  )
}

/* ── 第 2 步：改草稿 ── */
const SELF = ['服务区域正确', '价格没写错', '联系方式正确', '没有夸大说法']
function Edit({ article, onChange, onConfirm, onRegen }: { article: Article; onChange: (a: Article) => void; onConfirm: () => void; onRegen: () => void }) {
  const { profile, go } = useFlow()
  const [ask, setAsk] = useState(false)
  const [self, setSelf] = useState<string[]>([])
  const fs = facts(profile)
  return (
    <div className="grid items-start gap-4 lg:grid-cols-[1fr_320px]">
      <Panel>
        <input value={article.title} onChange={(e) => onChange({ ...article, title: e.target.value })} aria-label="文章标题"
          className="mb-4 w-full bg-transparent text-h1 font-black tracking-tight outline-none placeholder:text-ink-3" />
        <RichEditor html={article.html ?? toHtml(article.body)} onChange={(html, text) => onChange({ ...article, html, body: `${article.title}\n\n${text}` })} />
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div className="relative">
            <Confirm open={ask} text="重新生成会替换全部内容，包括你改过的部分。" ok="替换" onCancel={() => setAsk(false)} onOk={() => { setAsk(false); onRegen() }} />
            <button onClick={() => setAsk((v) => !v)} className="flex h-11 items-center gap-2 rounded-full border border-line px-5 text-body hover:bg-sunken"><RefreshCw className="size-4" />重新生成</button>
          </div>
          <motion.button whileTap={{ scale: 0.97 }} onClick={onConfirm} className="ml-auto flex h-11 items-center gap-2 rounded-full bg-accent px-6 text-body font-semibold text-on-accent shadow-lg shadow-accent/30">
            确认文章<Check className="size-4" strokeWidth={3} />
          </motion.button>
        </div>
      </Panel>

      <div className="grid gap-4 lg:sticky lg:top-6">
        <Panel title="确认前自查">
          <ul className="grid gap-2">
            {SELF.map((t) => {
              const on = self.includes(t)
              return <li key={t}><label className="flex cursor-pointer items-center gap-3 text-body">
                <input type="checkbox" checked={on} onChange={() => setSelf(on ? self.filter((x) => x !== t) : [...self, t])} className="peer sr-only" />
                <span className={cx('grid size-5 place-items-center rounded-md border transition-colors peer-focus-visible:ring-4 peer-focus-visible:ring-accent/25', on ? 'border-accent bg-accent text-on-accent' : 'border-mark')}>{on && <Check className="size-3" strokeWidth={3} />}</span>{t}
              </label></li>
            })}
          </ul>
          <p className="mt-3 text-caption text-ink-3">只是提醒，不影响确认。</p>
        </Panel>
        {article.source && (
          <Panel className="bg-accent-soft/60">
            <p className="flex items-center gap-1.5 text-eyebrow font-semibold text-ink-2"><Link2 className="size-3" />来自诊断</p>
            <p className="mt-1 text-body font-semibold">{article.source.q} · {article.source.platform}</p>
            <p className="text-caption text-ink-2">缺口：{article.source.gap}没有说清</p>
          </Panel>
        )}
        <Panel title="文章引用的事实">
          <p className="-mt-2 mb-3 text-caption text-ink-3">和你的实际情况对一遍，有出入先改资料。</p>
          <ul className="grid gap-2.5 text-body">
            {fs.map((f) => (
              <li key={f.key} className="grid gap-0.5">
                <span className="text-eyebrow text-ink-3">{f.label}</span>
                {f.value ? <span className="line-clamp-2">{f.value}</span> : <button onClick={() => go('content', { tab: 'profile', focusField: f.anchor })} className="w-fit text-caption font-semibold underline underline-offset-4">未填写，去补充</button>}
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  )
}

/* ── 第 3 步：已确认 ── */
function Done({ article, onEdit }: { article: Article; onEdit: () => void }) {
  const { go, orders } = useFlow()
  const [ask, setAsk] = useState(false)
  return (
    <div className="grid gap-4">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: EASE }} className="flex flex-wrap items-center gap-4 rounded-panel bg-accent-soft p-6">
        <span className="grid size-12 place-items-center rounded-full bg-accent text-on-accent"><motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.15, ...SPRING }}><Check className="size-6" strokeWidth={3} /></motion.span></span>
        <div className="min-w-48 flex-1"><h2 className="text-h2 font-bold">文章已确认</h2><p className="text-caption text-ink-2">发布时按这份原文发出。</p></div>
        <motion.button whileTap={{ scale: 0.97 }} onClick={() => go('publish')} className="flex h-12 items-center gap-2 rounded-full bg-mint px-7 text-body font-semibold text-on-brand shadow-lg shadow-mint/30">
          去发布这篇<ArrowRight className="size-4" />
        </motion.button>
      </motion.div>
      <Panel>
        <h3 className="text-h1 font-black tracking-tight">{article.title}</h3>
        <div className="dd-prose mt-4 text-ink-2" dangerouslySetInnerHTML={{ __html: article.html ?? toHtml(article.body) }} />
        <div className="relative mt-6 flex items-center gap-3 border-t border-line pt-4">
          <span className="text-caption text-ink-3">已确认{orders.length ? ' · 已发订单不变' : ''}</span>
          <div className="relative ml-auto">
            <Confirm end open={ask} text="编辑后回到草稿，需重新确认才能发布。" ok="继续编辑" onCancel={() => setAsk(false)} onOk={() => { setAsk(false); onEdit() }} />
            <button onClick={() => setAsk((v) => !v)} className="flex h-10 items-center gap-2 rounded-full border border-line px-5 text-body hover:bg-sunken"><PenLine className="size-4" />编辑文章</button>
          </div>
        </div>
      </Panel>
    </div>
  )
}

export function Content() {
  const { article, setArticle, params, go, state, profile } = useFlow()
  const [tab, setTab] = useState(params.tab ?? (state === 'setup' ? 'profile' : 'article'))
  const at = !article ? 0 : article.status === 'draft' ? 1 : 2
  const need = missingMust(profile).length
  const plus = checklist(profile).filter((i) => i.tier === 'plus' && !i.ok).length
  return (
    <ModuleShell title="品牌内容" eyebrow="第 2 步 · 内容" desc="先填好品牌资料，再写文章" tab={tab} onTab={setTab}
      tabs={[{ id: 'profile', label: '品牌资料', badge: need ? `缺 ${need}` : plus ? `可补 ${plus}` : undefined, dot: !!need }, { id: 'article', label: '文章写作', badge: ['未写', '草稿', '已确认'][at] }]}
      aside={tab === 'article' ? <Stepper at={at} /> : undefined}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={tab + (tab === 'article' ? at : '')} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3, ease: EASE }}>
          {tab === 'profile' ? <ProfileTab />
            : need ? (
              <Panel className="grid place-items-center gap-3 py-12 text-center">
                <p className="text-h3 font-bold">先补全品牌资料，再写文章</p>
                <p className="max-w-sm text-body text-ink-2">文章会引用资料里的地址、产品和特点。还差 {need} 项必填。</p>
                <button onClick={() => setTab('profile')} className="h-11 rounded-full bg-accent px-6 text-body font-semibold text-on-accent">去补全资料</button>
              </Panel>
            ) : !article ? <Brief source={params.source} onDone={setArticle} />
            : article.status === 'draft' ? <Edit article={article} onChange={setArticle} onConfirm={() => setArticle({ ...article, status: 'confirmed' })} onRegen={() => setArticle(null)} />
            : <Done article={article} onEdit={() => setArticle({ ...article, status: 'draft' })} />}
        </motion.div>
      </AnimatePresence>
    </ModuleShell>
  )
}
