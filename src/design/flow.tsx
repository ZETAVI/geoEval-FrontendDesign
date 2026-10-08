import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { ARTICLE, type Page } from './shared'
import { BRANDS, NOTICES, ORDERS, TICKETS, type Brand, type Notice, type Order, type Ticket } from './data'
import { EMPTY, FULL, missingMust, type Profile } from './profile'

/** 诊断带来的写作方向：从报告带进内容页 */
export type Source = { q: string; platform: string; gap: string }
export type Params = { source?: Source; focusOrder?: string; tab?: string; focusField?: string; orderId?: string; ticketId?: string; compose?: boolean }
export type Article = { title: string; body: string; html?: string; status: 'draft' | 'confirmed'; source?: Source }

/** 品牌所处位置：首页“下一步”的唯一来源 */
export type BrandState = 'setup' | 'ready' | 'report' | 'draft' | 'publishable' | 'published'
export const STATE_LABEL: Record<BrandState, string> = {
  setup: '资料待补全', ready: '可以开始诊断', report: '已出报告', draft: '文章待确认', publishable: '可以发布', published: '已有发布订单',
}

export const SAMPLE_BODY = `${ARTICLE.title}

青禾家政成立于 2016 年，专注上海本地的家庭保洁与保姆服务。每一次上门前，我们会和你确认服务清单与时间；上门后，阿姨按清单逐项完成，结束时与你一起验收。

我们的阿姨上岗前都经过 40 学时的培训与考核，深度保洁、母婴护理、老人陪护各有固定的操作流程。`

type Snap = { profile: Profile; diagnosed: boolean; article: Article | null; orders: Order[] }
type Flow = {
  page: Page; params: Params
  profile: Profile; setProfile: (p: Profile) => void
  go: (p: Page, params?: Params) => void
  balance: number; setBalance: (fn: (b: number) => number) => void
  diagnosed: boolean; setDiagnosed: (v: boolean) => void
  article: Article | null; setArticle: (a: Article | null) => void
  orders: Order[]; addOrder: (o: Order) => void
  state: BrandState; preset: (s: BrandState) => void
  brands: Brand[]; brand: Brand; switchBrand: (id: string) => void; addBrand: (name: string) => void
  notices: Notice[]; readNotice: (id?: string) => void
  tickets: Ticket[]; addTicket: (t: Ticket) => void; replyTicket: (id: string, text: string, files?: string[]) => void; resolveTicket: (id: string) => void
  gate: number | null; openGate: (need: number) => void; closeGate: () => void
}
const Ctx = createContext<Flow | null>(null)
export const useFlow = () => {
  const c = useContext(Ctx)
  if (!c) throw new Error('useFlow 需要在 FlowProvider 内使用')
  return c
}

export function FlowProvider({ children }: { children: ReactNode }) {
  const [page, setPage] = useState<Page>('home')
  const [params, setParams] = useState<Params>({})
  const [balance, setBal] = useState(2800)
  const [diagnosed, setDiagnosed] = useState(true)
  const [article, setArticle] = useState<Article | null>({ title: ARTICLE.title, body: SAMPLE_BODY, status: 'confirmed' })
  const [orders, setOrders] = useState<Order[]>(ORDERS)
  const [profile, setProfile] = useState<Profile>(FULL)
  const [gate, setGate] = useState<number | null>(null)
  const [brands, setBrands] = useState<Brand[]>(BRANDS)
  const [brandId, setBrandId] = useState(BRANDS[0].id)
  const [snaps, setSnaps] = useState<Record<string, Snap>>({ b2: { profile: EMPTY, diagnosed: false, article: null, orders: [] } })
  const [notices, setNotices] = useState<Notice[]>(NOTICES)
  const [tickets, setTickets] = useState<Ticket[]>(TICKETS)

  const switchBrand = (id: string) => {
    if (id === brandId) return
    const next = snaps[id] ?? { profile: EMPTY, diagnosed: false, article: null, orders: [] }
    setSnaps((m) => ({ ...m, [brandId]: { profile, diagnosed, article, orders } }))
    setBrandId(id); setProfile(next.profile); setDiagnosed(next.diagnosed); setArticle(next.article); setOrders(next.orders)
  }
  const addBrand = (name: string) => {
    const id = `b${Date.now()}`
    setBrands((v) => [...v, { id, name, industry: '待填写' }])
    setSnaps((m) => ({ ...m, [brandId]: { profile, diagnosed, article, orders }, [id]: { profile: { ...EMPTY, company: name }, diagnosed: false, article: null, orders: [] } }))
    setBrandId(id); setProfile({ ...EMPTY, company: name }); setDiagnosed(false); setArticle(null); setOrders([])
    setParams({ tab: 'profile' }); setPage('content')
  }
  const go = useCallback((p: Page, q: Params = {}) => { setParams(q); setPage(p) }, [])
  const state: BrandState = missingMust(profile).length ? 'setup' : !diagnosed ? 'ready' : !article ? 'report' : article.status === 'draft' ? 'draft' : orders.length ? 'published' : 'publishable'

  const value = useMemo<Flow>(() => ({
    page, params, go, profile, setProfile, balance, setBalance: setBal, diagnosed, setDiagnosed, article, setArticle, orders,
    addOrder: (o) => setOrders((v) => [o, ...v]),
    state,
    preset: (s) => {
      setProfile(s === 'setup' ? EMPTY : FULL)
      setDiagnosed(s !== 'ready' && s !== 'setup')
      setArticle(s === 'setup' || s === 'ready' || s === 'report' ? null : { title: ARTICLE.title, body: SAMPLE_BODY, status: s === 'draft' ? 'draft' : 'confirmed' })
      setOrders(s === 'published' ? ORDERS : [])
    },
    brands, brand: brands.find((b) => b.id === brandId) ?? brands[0], switchBrand, addBrand,
    notices, readNotice: (id) => setNotices((v) => v.map((n) => (!id || n.id === id ? { ...n, unread: false } : n))),
    tickets, addTicket: (t) => setTickets((v) => [t, ...v]),
    replyTicket: (id, text, files) => setTickets((v) => v.map((t) => t.id === id ? { ...t, status: 'open', updated: '刚刚', msgs: [...t.msgs, { from: 'me', text, time: '刚刚', files }, { from: 'system', text: t.status === 'solved' ? '工单已重新打开，客服会尽快回复' : '已转交客服，工作日通常 2 小时内回复', time: '刚刚' }] } : t)),
    resolveTicket: (id) => setTickets((v) => v.map((t) => t.id === id ? { ...t, status: 'solved', updated: '刚刚', msgs: [...t.msgs, { from: 'system', text: '你已将工单标记为已解决', time: '刚刚' }] } : t)),
    gate, openGate: setGate, closeGate: () => setGate(null),
  }), [page, params, go, profile, setProfile, balance, diagnosed, article, orders, state, gate, brands, brandId, snaps, notices, tickets])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

if (import.meta.hot) import.meta.hot.accept(() => import.meta.hot!.invalidate())
