import { useEffect, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Check, ChevronDown, ChevronRight, MapPin, Plus, Search, Sparkles, X } from 'lucide-react'
import { useFlow } from './flow'
import { SPRING } from './motion'
import { cx } from './shared'
import { Chip, TextField } from './kit'
import { CUSTOMERS, FEATURE_SUGGEST, INDUSTRY, PLACES, POSITIONING, PRICE, checklist, placeOf, type Feature, type Profile } from './profile'

const input = 'h-11 w-full rounded-control border border-line bg-surface px-3 text-body outline-none transition-shadow focus:border-accent focus:ring-4 focus:ring-accent/20'

function Field({ id, label, req, hint, count, children }: { id: string; label: string; req?: boolean; hint?: string; count?: string; children: ReactNode }) {
  return (
    <div id={id} className="scroll-mt-24 rounded-control transition-shadow">
      <div className="mb-2 flex items-baseline gap-2">
        <span className="text-body font-semibold">{label}</span>
        {req ? <span className="text-eyebrow font-semibold text-accent-ink">必填</span> : <span className="text-eyebrow text-ink-3">选填</span>}
        {count && <span className="ml-auto text-eyebrow tabular-nums text-ink-3">{count}</span>}
      </div>
      {children}
      {hint && <p className="mt-1.5 text-caption text-ink-3">{hint}</p>}
    </div>
  )
}

function Group({ title, desc, children }: { title: string; desc: string; children: ReactNode }) {
  return (
    <section className="rounded-panel border border-line bg-surface p-6 shadow-soft">
      <h2 className="flex items-center gap-2.5 text-h3 font-bold"><span className="h-5 w-1 rounded-full bg-accent" />{title}</h2>
      <p className="mb-5 ml-3.5 mt-0.5 text-caption text-ink-2">{desc}</p>
      <div className="grid gap-6">{children}</div>
    </section>
  )
}

function Seg<T extends string>({ value, options, onChange, label }: { value: T | ''; options: readonly T[]; onChange: (v: T) => void; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((o) => (
        <Chip key={o} role="radio" on={value === o} onClick={() => onChange(o)}>{o}</Chip>
      ))}
    </div>
  )
}

function Chips({ value, options, max, onChange, label }: { value: string[]; options: string[]; max: number; onChange: (v: string[]) => void; label: string }) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((o) => {
        const on = value.includes(o)
        return (
          <Chip key={o} size="sm" on={on} onClick={() => onChange(on ? value.filter((x) => x !== o) : value.length < max ? [...value, o] : value)}>{o}</Chip>
        )
      })}
    </div>
  )
}

const EXAMPLE: Record<string, string> = {
  上门流程规范: '预约、到家、验收三步，全程留痕',
  阿姨培训到位: '上岗前 40 小时实操培训，持证上岗',
  价格透明: '下单前报价，现场不加价',
  服务有保障: '服务不满意，免费返工一次',
  响应速度快: '咨询 10 分钟内回复，最快当天上门',
  '本地 10 年经验': '2016 年起在本地服务，累计 3 万户',
}

function Features({ value, onChange }: { value: Feature[]; onChange: (v: Feature[]) => void }) {
  const [adding, setAdding] = useState(false)
  const [t, setT] = useState('')
  const [focusName, setFocusName] = useState<string | null>(null)
  const refs = useRef<Record<string, HTMLInputElement | HTMLTextAreaElement | null>>({})
  const names = value.map((f) => f.name)
  const full = value.length >= 6
  useEffect(() => { if (focusName) { refs.current[focusName]?.focus(); setFocusName(null) } }, [focusName, value])
  const add = (v: string) => {
    v = v.trim()
    if (v && v.length <= 12 && !names.includes(v) && !full) { onChange([...value, { name: v, detail: '' }]); setFocusName(v) }
    setT('')
  }
  const toggle = (v: string) => (names.includes(v) ? onChange(value.filter((f) => f.name !== v)) : add(v))
  const patch = (name: string, detail: string) => onChange(value.map((f) => (f.name === name ? { ...f, detail } : f)))
  const custom = names.filter((n) => !FEATURE_SUGGEST.includes(n))
  const filled = value.filter((f) => f.detail.trim().length >= 6).length
  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap gap-2" role="group" aria-label="品牌特点">
        {[...FEATURE_SUGGEST, ...custom].map((x) => (
          <Chip key={x} size="sm" on={names.includes(x)} onClick={() => toggle(x)} disabled={!names.includes(x) && full}>{x}</Chip>
        ))}
        {adding ? (
          <TextField className="h-8! w-44 px-3!" label="自定义品牌特点" value={t} onChange={setT} max={12} placeholder="输入后回车" autoFocus clearable={false}
            onEnter={() => { add(t); setAdding(false) }} onBlur={() => { if (t.trim()) add(t); setAdding(false) }} />
        ) : (
          <Chip size="sm" dashed disabled={full} onClick={() => setAdding(true)}><Plus className="size-3.5" />自定义</Chip>
        )}
      </div>

      <div aria-live="polite" className="grid gap-2.5">
        <p className="flex items-center justify-between text-caption">
          <span className="text-ink-2">已选 <b className="text-body font-bold tabular-nums text-accent-ink">{value.length}</b> / 6 项{full && <span className="ml-2 text-ink-3">已达上限</span>}</span>
          <span className={value.length < 2 ? 'font-semibold text-accent-ink' : 'text-ink-3'}>{value.length < 2 ? `还需再选 ${2 - value.length} 项` : `${filled} 项已写具体做法`}</span>
        </p>
        {value.length === 0 ? (
          <p className="rounded-control border border-dashed border-line px-4 py-6 text-center text-caption text-ink-3">点上面的标签，或点“自定义”写你自己的。</p>
        ) : (
          <ul className="grid gap-2.5">
            <AnimatePresence initial={false}>
              {value.map((f, i) => {
                const ok = f.detail.trim().length >= 6
                const eg = EXAMPLE[f.name]
                const next = value[i + 1]
                return (
                  <motion.li key={f.name} layout initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }} transition={SPRING}
                    className={cx('rounded-control border p-3 transition-colors', ok ? 'border-accent/40 bg-accent-soft/40' : 'border-line bg-surface')}>
                    <div className="mb-2 flex items-center gap-2">
                      <span className={cx('grid size-5 shrink-0 place-items-center rounded-full transition-colors', ok ? 'bg-accent text-on-accent' : 'border border-dashed border-mark')}>{ok && <Check className="size-3" strokeWidth={3} />}</span>
                      <span className="min-w-0 flex-1 truncate text-body font-semibold">{f.name}</span>
                      {!f.detail && eg && <button type="button" onClick={() => patch(f.name, eg)} className="flex h-7 items-center gap-1 rounded-full px-2.5 text-caption font-semibold text-accent-ink hover:bg-accent-soft"><Sparkles className="size-3" />填入示例</button>}
                      <button type="button" onClick={() => onChange(value.filter((x) => x.name !== f.name))} aria-label={`移除${f.name}`} className="grid size-7 place-items-center rounded-full text-ink-3 hover:bg-sunken hover:text-ink"><X className="size-4" /></button>
                    </div>
                    <TextField label={`${f.name}的具体做法`} value={f.detail} onChange={(d) => patch(f.name, d)} max={40} inputRef={(el) => { refs.current[f.name] = el }}
                      placeholder={eg ? `例：${eg}` : '一句话写具体做法或数据（选填）'} onEnter={() => (next ? setFocusName(next.name) : (document.activeElement as HTMLElement | null)?.blur())} />
                  </motion.li>
                )
              })}
            </AnimatePresence>
          </ul>
        )}
      </div>
    </div>
  )
}

function Cascader({ p, set }: { p: Profile; set: (v: Partial<Profile>) => void }) {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const [a, setA] = useState(p.industry?.[0] ?? Object.keys(INDUSTRY)[0])
  const box = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const h = (e: MouseEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [open])
  const pick = (x: string, y: string) => { set({ industry: [x, y], industryNote: y === '其他' ? p.industryNote : '' }); setOpen(false); setQ('') }
  const hits = q.trim() ? Object.entries(INDUSTRY).flatMap(([x, ys]) => ys.filter((y) => y !== '其他' && (y.includes(q.trim()) || x.includes(q.trim()))).map((y) => [x, y] as const)) : []
  return (
    <div ref={box} className="relative grid gap-3">
      <button onClick={() => setOpen((o) => !o)} aria-haspopup="listbox" aria-expanded={open} aria-label="所属行业" className={cx(input, 'flex items-center justify-between text-left')}>
        {p.industry?.[1] ? <span>{p.industry[0]} <span className="text-ink-3">/</span> <span className="font-semibold">{p.industry[1]}</span></span> : <span className="text-ink-3">选择行业</span>}
        <ChevronDown className={cx('size-4 text-ink-3 transition-transform', open && 'rotate-180')} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="absolute inset-x-0 top-12 z-30 overflow-hidden rounded-control border border-line bg-surface shadow-raised">
            <div className="relative border-b border-line p-2">
              <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-ink-3" />
              <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="搜索行业，如“家政”" aria-label="搜索行业" className="h-10 w-full rounded-control bg-sunken pl-9 pr-3 text-body outline-none focus:ring-4 focus:ring-accent/20" />
            </div>
            {q.trim() ? (
              <ul role="listbox" className="max-h-64 overflow-auto p-1.5">
                {hits.length === 0 && <li className="px-3 py-6 text-center text-caption text-ink-3">没有匹配项，可选择“其他”并说明</li>}
                {hits.map(([x, y]) => (
                  <li key={x + y}><button onClick={() => pick(x, y)} className="flex w-full items-center gap-2 rounded-control px-3 py-2.5 text-left text-body hover:bg-sunken"><span className="text-ink-3">{x}</span><ChevronRight className="size-3 text-ink-3" /><span className="font-semibold">{y}</span></button></li>
                ))}
              </ul>
            ) : (
              <div className="grid max-h-64 grid-cols-[9rem_1fr]">
                <ul className="overflow-auto border-r border-line bg-sunken/50 p-1.5">
                  {Object.keys(INDUSTRY).map((x) => (
                    <li key={x}><button onMouseEnter={() => setA(x)} onClick={() => setA(x)} className={cx('flex w-full items-center justify-between rounded-control px-3 py-2 text-left text-body', a === x ? 'bg-surface font-semibold shadow-soft' : 'hover:bg-surface/60')}>{x}<ChevronRight className="size-3 text-ink-3" /></button></li>
                  ))}
                </ul>
                <ul role="listbox" className="overflow-auto p-1.5">
                  {INDUSTRY[a].map((y) => {
                    const on = p.industry?.[0] === a && p.industry[1] === y
                    return <li key={y}><button role="option" aria-selected={on} onClick={() => pick(a, y)} className={cx('flex w-full items-center justify-between rounded-control px-3 py-2 text-left text-body hover:bg-sunken', on && 'font-semibold')}>{y}{on && <Check className="size-4 text-ink" strokeWidth={3} />}</button></li>
                  })}
                </ul>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      {p.industry?.[1] === '其他' && <TextField value={p.industryNote} onChange={(industryNote) => set({ industryNote })} max={60} placeholder="用 2–60 字写明具体行业" label="行业说明" />}
    </div>
  )
}

function MapMock() {
  return (
    <svg viewBox="0 0 320 120" className="h-full w-full" aria-hidden>
      <rect width="320" height="120" fill="var(--s-soft)" />
      <g stroke="var(--s-line)" strokeWidth="1"><path d="M0 40H320M0 88H320M70 0V120M170 0V120M250 0V120" /></g>
      <g stroke="var(--s-mark)" strokeWidth="6" strokeLinecap="round" fill="none"><path d="M-10 70 Q120 50 330 76" /><path d="M200 -6 L150 130" /></g>
      <rect x="84" y="8" width="60" height="26" rx="4" fill="var(--s-line)" opacity=".6" /><rect x="206" y="92" width="70" height="22" rx="4" fill="var(--s-line)" opacity=".6" />
      <g transform="translate(168 52)"><circle r="16" fill="var(--s-accent)" opacity=".2" /><path d="M0 -14a9 9 0 0 1 9 9c0 7-9 16-9 16s-9-9-9-16a9 9 0 0 1 9-9z" fill="var(--s-accent)" /><circle cy="-5" r="3.2" fill="var(--s-bg)" /></g>
    </svg>
  )
}

function Address({ p, set }: { p: Profile; set: (v: Partial<Profile>) => void }) {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const place = p.addressOk ? placeOf(p.address) : undefined
  const list = PLACES.filter((x) => !q.trim() || x.full.includes(q.trim()))
  if (p.addressOk) return (
    <div className="overflow-hidden rounded-control border border-line bg-surface">
      <div className="h-28"><MapMock /></div>
      <div className="flex items-start gap-3 p-3.5">
        <div className="min-w-0 flex-1">
          <p className="text-body font-semibold">{place?.name ?? p.address}</p>
          <p className="mt-0.5 text-caption text-ink-2">{p.address}</p>
          <p className="mt-1.5 flex items-center gap-1 text-caption text-ink-3"><span className="font-semibold text-mint"><Check className="mr-0.5 inline size-3" strokeWidth={3} />已通过高德校验</span>{place && <span>· {place.district}</span>}</p>
        </div>
        <button onClick={() => { set({ address: '', addressOk: false }); setQ('') }} className="h-9 shrink-0 rounded-full border border-line px-3.5 text-caption font-semibold hover:border-ink-3">重新选择</button>
      </div>
    </div>
  )
  return (
    <div className="relative">
      <MapPin className="absolute left-3 top-3.5 size-4 text-ink-3" />
      <input value={q} onChange={(e) => { setQ(e.target.value); setOpen(true) }} onFocus={() => setOpen(true)} onBlur={() => setTimeout(() => setOpen(false), 120)}
        role="combobox" aria-expanded={open} aria-label="公司地址" placeholder="输入路名或小区，搜索高德地址" className={cx(input, 'pl-9')} />
      <AnimatePresence>
        {open && (
          <motion.ul initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} role="listbox" className="absolute inset-x-0 top-full z-20 mt-1 overflow-hidden rounded-control border border-line bg-surface shadow-raised">
            {list.length === 0 && <li className="px-3 py-5 text-center text-caption text-ink-3">没有找到，换个关键词试试</li>}
            {list.map((x) => (
              <li key={x.full} role="option" aria-selected={false}><button onMouseDown={(e) => e.preventDefault()} onClick={() => { set({ address: x.full, addressOk: true }); setOpen(false) }} className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left hover:bg-sunken"><MapPin className="size-4 shrink-0 text-ink-3" /><span><span className="block text-body font-semibold">{x.name}</span><span className="block text-caption text-ink-3">{x.full}</span></span></button></li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}

function PriceRange({ p, set }: { p: Profile; set: (v: Partial<Profile>) => void }) {
  const { min, max, step } = PRICE
  const pct = (v: number) => ((v - min) / (max - min)) * 100
  const thumb = 'pointer-events-none absolute inset-0 h-6 w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:size-5 [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-accent [&::-webkit-slider-thumb]:bg-surface [&::-webkit-slider-thumb]:shadow-soft [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:size-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-accent [&::-moz-range-thumb]:bg-surface focus-visible:[&::-webkit-slider-thumb]:ring-4 focus-visible:[&::-webkit-slider-thumb]:ring-accent/25 focus:outline-none'
  const snap = (v: number) => Math.round(v / step) * step
  const clampLo = (v: number) => set({ lo: Math.min(Math.max(snap(v) || min, min), p.hi - step) })
  const clampHi = (v: number) => set({ hi: Math.max(Math.min(snap(v) || max, max), p.lo + step) })
  const off = p.negotiable
  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center gap-2">
        {PRICE.presets.map(([l, h]) => {
          const on = !off && p.lo === l && p.hi === h
          return <Chip key={l} on={on} onClick={() => set({ lo: l, hi: h, negotiable: false })} size="sm"><span className="tabular-nums">¥{l}–{h}</span></Chip>
        })}
        <Chip on={off} size="sm" onClick={() => set({ negotiable: !off })}>面议</Chip>
      </div>
      <div className={cx('grid gap-3 transition-opacity', off && 'pointer-events-none opacity-40')} aria-hidden={off}>
        <div className="relative mx-2.5 h-6">
          <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-sunken" />
          <div className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-accent" style={{ left: `${pct(p.lo)}%`, right: `${100 - pct(p.hi)}%` }} />
          <input type="range" aria-label="最低价" disabled={off} min={min} max={max} step={step} value={p.lo} onChange={(e) => clampLo(+e.target.value)} className={thumb} />
          <input type="range" aria-label="最高价" disabled={off} min={min} max={max} step={step} value={p.hi} onChange={(e) => clampHi(+e.target.value)} className={thumb} />
        </div>
        <div className="flex items-center gap-2.5">
          <label className="flex items-center gap-1.5 text-caption text-ink-2">¥<input type="number" disabled={off} value={p.lo} step={step} onChange={(e) => clampLo(+e.target.value)} aria-label="最低价" className={cx(input, 'h-10 w-24 tabular-nums')} /></label>
          <span className="text-ink-3">—</span>
          <label className="flex items-center gap-1.5 text-caption text-ink-2">¥<input type="number" disabled={off} value={p.hi} step={step} onChange={(e) => clampHi(+e.target.value)} aria-label="最高价" className={cx(input, 'h-10 w-24 tabular-nums')} /></label>
        </div>
      </div>
    </div>
  )
}

export function ProfileTab() {
  const { profile, setProfile, params, diagnosed } = useFlow()
  const [d, setD] = useState(profile)
  const [saved, setSaved] = useState(false)
  const set = (v: Partial<Profile>) => { setD((x) => ({ ...x, ...v })); setSaved(false) }
  const list = checklist(d)
  const must = list.filter((i) => i.tier === 'must'), plus = list.filter((i) => i.tier === 'plus')
  const mustOk = must.filter((i) => i.ok).length
  const dirty = JSON.stringify(d) !== JSON.stringify(profile)
  const jump = (id: string) => {
    const el = document.getElementById(id)
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    el?.classList.add('ring-4', 'ring-accent/30')
    setTimeout(() => el?.classList.remove('ring-4', 'ring-accent/30'), 1200)
    el?.querySelector<HTMLElement>('input,textarea,button')?.focus({ preventScroll: true })
  }
  const first = useRef(true)
  useEffect(() => { if (first.current && params.focusField) { first.current = false; setTimeout(() => jump(params.focusField!), 350) } }, []) // eslint-disable-line react-hooks/exhaustive-deps
  const save = () => { setProfile(d); setSaved(true) }

  return (
    <div className="grid items-start gap-5 lg:grid-cols-[1fr_300px]">
      <div className="grid gap-5">
        <Group title="基本信息" desc="用于确认你是哪一家店。">
          <Field id="f-industry" label="所属行业" req><Cascader p={d} set={set} /></Field>
          <div className="grid gap-6 md:grid-cols-2">
            <Field id="f-company" label="公司名称" req><TextField value={d.company} onChange={(company) => set({ company })} label="公司名称" max={30} placeholder="营业执照上的全称" /></Field>
            <Field id="f-contact" label="联系人与手机" req hint={d.phone && !/^1\d{10}$/.test(d.phone) ? '手机号需要 11 位数字' : undefined}>
              <div className="flex gap-2"><TextField className="w-32 shrink-0" value={d.contact} onChange={(contact) => set({ contact })} label="联系人" max={10} placeholder="联系人" clearable={false} /><TextField className="flex-1" type="tel" inputMode="numeric" value={d.phone} onChange={(v) => set({ phone: v.replace(/\D/g, '').slice(0, 11) })} label="手机号" max={11} placeholder="手机号" invalid={!!d.phone && d.phone.length === 11 && !/^1\d{10}$/.test(d.phone)} /></div>
            </Field>
          </div>
          <Field id="f-address" label="公司地址" req hint={d.addressOk ? undefined : '从搜索结果中选择，地址会经高德校验。'}><Address p={d} set={set} /></Field>
        </Group>

        <Group title="主营业务" desc="文章最常引用这一部分。">
          <Field id="f-product" label="主营产品" req hint="用顿号分隔，写你最想被 AI 提到的几项。">
            <TextField multiline rows={2} max={80} value={d.product} onChange={(product) => set({ product })} label="主营产品" placeholder="例：日常保洁、深度保洁、月嫂" />
          </Field>
          <Field id="f-features" label="品牌特点" req hint="至少选 2 项；每项写一句具体做法或数据，AI 更愿意引用。"><Features value={d.features} onChange={(features) => set({ features })} /></Field>
          <Field id="f-price" label="客单价" hint="单次消费的大致范围，以 10 元为一档。"><PriceRange p={d} set={set} /></Field>
        </Group>

        <Group title="目标客户" desc="决定文章写给谁看。">
          <Field id="f-customers" label="客户类型" count={`${d.customers.length}/5`}><Chips label="目标客户" value={d.customers} options={CUSTOMERS} max={5} onChange={(customers) => set({ customers })} /></Field>
          <Field id="f-positioning" label="品牌定位"><Seg label="品牌定位" value={d.positioning} options={POSITIONING} onChange={(positioning) => set({ positioning })} /></Field>
          <Field id="f-background" label="品牌背景" hint="成立时间、团队规模、服务过多少客户，写得越具体越可信。">
            <TextField multiline rows={3} max={200} value={d.background} onChange={(background) => set({ background })} label="品牌背景" placeholder="例：2016 年成立，团队 120 人，累计服务 3 万户家庭" />
          </Field>
        </Group>
      </div>

      <aside className="grid gap-4 lg:sticky lg:top-6">
        <section className="rounded-panel border border-line bg-surface p-5 shadow-soft">
          <div className="flex items-baseline justify-between"><h2 className="text-h3 font-bold">资料完整度</h2><span className="text-caption tabular-nums text-ink-2">{mustOk}/{must.length}</span></div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-sunken"><motion.div className="h-full rounded-full bg-accent" animate={{ width: `${(list.filter((i) => i.ok).length / list.length) * 100}%` }} transition={SPRING} /></div>
          {[['诊断必填', must], ['建议补充', plus]].map(([t, arr]) => (
            <div key={t as string} className="mt-4">
              <p className="mb-1.5 text-eyebrow font-semibold text-ink-3">{t as string}</p>
              <ul className="grid gap-0.5">
                {(arr as typeof list).map((i) => (
                  <li key={i.key}><button onClick={() => jump(i.anchor)} className="flex w-full items-center gap-2.5 rounded-control px-2 py-1.5 text-left text-body hover:bg-sunken">
                    <span className={cx('grid size-4.5 shrink-0 place-items-center rounded-full', i.ok ? 'bg-accent text-on-accent' : 'border border-dashed border-mark')}>{i.ok && <Check className="size-3" strokeWidth={3} />}</span>
                    <span className={i.ok ? 'text-ink-2' : 'font-semibold'}>{i.label}</span>
                  </button></li>
                ))}
              </ul>
            </div>
          ))}
          <motion.button whileTap={{ scale: 0.98 }} onClick={save} disabled={!dirty} className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-accent text-body font-semibold text-on-accent shadow-lg shadow-accent/25 disabled:bg-sunken disabled:text-ink-3 disabled:shadow-none">
            {saved ? <><Check className="size-4" strokeWidth={3} />已保存</> : '保存资料'}
          </motion.button>
          <p className="mt-2 text-caption text-ink-3" aria-live="polite">
            {mustOk < must.length ? `还差 ${must.length - mustOk} 项必填。` : diagnosed && dirty ? '保存后，旧报告会标为“基于旧资料”。' : '必填项已齐，可以诊断。'}
          </p>
        </section>
      </aside>
    </div>
  )
}
