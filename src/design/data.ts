import { mediaById, type Kind } from './media'

/* ── 发布方案：套餐只承诺“范围”，具体媒体由运维发布后同步 ── */
export const PACKS: { id: string; name: string; n: number; pts: number; desc: string; tag: string; kinds: Kind[]; days: [number, number] }[] = [
  { id: 'base', name: '基础覆盖', n: 10, pts: 500, desc: '适合第一次发布', tag: '', kinds: ['地方', '行业', '生活'], days: [1, 3] },
  { id: 'multi', name: '多点分布', n: 10, pts: 900, desc: '门户、本地、行业都有', tag: '推荐', kinds: ['门户', '地方', '行业', '生活'], days: [2, 4] },
  { id: 'deep', name: '深度覆盖', n: 20, pts: 1600, desc: '含新闻源，周期更长', tag: '', kinds: ['新闻源', '门户', '地方', '行业'], days: [3, 5] },
]

/* ── 订单 ──
 * 套餐订单（mode=pack）：提交时不确定具体媒体，items 只包含运维已同步的上线记录；
 * 精准订单（mode=precise）：items 是用户所选媒体，逐家带状态。 */
export type ItemStatus = 'live' | 'review' | 'queued' | 'failed'
export const ITEM_LABEL: Record<ItemStatus, string> = { live: '已上线', review: '审核中', queued: '排队中', failed: '未上线' }
export type OrderItem = { mediaId: string; status: ItemStatus; time?: string }
export type Order = {
  id: string; article: string; plan: string; mode: 'pack' | 'precise'; pts: number
  total: number; kinds?: Kind[]; days?: [number, number]
  created: string; settleBy: string; settled: boolean; items: OrderItem[]; refunded?: number
}
export const orderStats = (o: Order) => {
  const live = o.items.filter((i) => i.status === 'live').length
  const failed = o.mode === 'precise' ? o.items.filter((i) => i.status === 'failed').length : o.settled ? o.total - live : 0
  const busy = !o.settled
  return { live, failed, total: o.total, busy, status: busy ? '发布中' : '已完成', refund: failed * Math.round(o.pts / o.total) }
}
const it = (mediaId: string, status: ItemStatus, time?: string): OrderItem => ({ mediaId, status, time })
export const ORDERS: Order[] = [
  {
    id: 'PO-0924', article: '青禾家政：把每一次上门服务讲清楚', plan: '多点分布 · 10 篇', mode: 'pack', pts: 900, total: 10, kinds: PACKS[1].kinds, days: PACKS[1].days,
    created: '9月24日 11:02', settleBy: '预计 9月30日前结算', settled: false,
    items: [it('m9', 'live', '9月25日 10:12'), it('m5', 'live', '9月25日 16:40'), it('m15', 'live', '9月26日 09:30')],
  },
  {
    id: 'PO-0920', article: '青禾家政：把每一次上门服务讲清楚', plan: '基础覆盖 · 10 篇', mode: 'pack', pts: 500, total: 10, kinds: PACKS[0].kinds, days: PACKS[0].days,
    created: '9月20日 16:40', settleBy: '9月25日已结算', settled: true, refunded: 50,
    items: [it('m10', 'live', '9月21日 09:30'), it('m15', 'live', '9月21日 11:05'), it('m16', 'live', '9月21日 15:20'), it('m11', 'live', '9月22日 10:00'), it('m9', 'live', '9月22日 14:18'), it('m12', 'live', '9月22日 16:02'), it('m17', 'live', '9月22日 17:30'), it('m21', 'live', '9月22日 18:12'), it('m22', 'live', '9月23日 09:40')],
  },
  {
    id: 'PO-0915', article: '青禾家政：把每一次上门服务讲清楚', plan: '精准发布 · 3 家', mode: 'precise', pts: 530, total: 3,
    created: '9月15日 14:20', settleBy: '预计 10月1日前结算', settled: false,
    items: [it('m9', 'live', '9月16日 10:00'), it('m5', 'review'), it('m10', 'queued')],
  },
]

/* ── 品牌 ── */
export type Brand = { id: string; name: string; industry: string }
export const BRANDS: Brand[] = [
  { id: 'b1', name: '青禾家政', industry: '家政服务 · 家庭保洁' },
  { id: 'b2', name: '青禾月嫂', industry: '家政服务 · 母婴护理' },
]

/* ── 通知 ── */
export type Notice = { id: string; kind: 'order' | 'diag' | 'pay' | 'system'; title: string; body: string; time: string; unread: boolean; to?: 'publish' | 'order' | 'report' | 'points' | 'help'; ref?: string }
export const NOTICES: Notice[] = [
  { id: 'n1', kind: 'order', title: '2 篇已上线', body: '订单 PO-0924 的上海热线、新浪家居已上线。', time: '今天 10:12', unread: true, to: 'order', ref: 'PO-0924' },
  { id: 'n2', kind: 'pay', title: '充值到账', body: '3,000 积分已到账，来自支付宝。', time: '9月23日', unread: true, to: 'points' },
  { id: 'n3', kind: 'order', title: '订单已结算', body: 'PO-0920 有 1 篇未上线，已退回 50 积分。', time: '9月25日', unread: false, to: 'order', ref: 'PO-0920' },
  { id: 'n4', kind: 'diag', title: '诊断报告已生成', body: '5 个平台的采样已完成，可查看排位。', time: '9月22日', unread: false, to: 'report' },
  { id: 'n5', kind: 'system', title: '工单已回复', body: '你的工单 T-1042 有新回复。', time: '9月21日', unread: false, to: 'help', ref: 'T-1042' },
]
export const NOTICE_LABEL = { order: '订单', diag: '诊断', pay: '支付', system: '服务' } as const

/* ── 工单与常见问题 ── */
export type Msg = { from: 'me' | 'agent' | 'system'; text: string; time: string; files?: string[] }
export type Ticket = { id: string; subject: string; category: string; status: 'open' | 'wait' | 'solved'; updated: string; related?: string; msgs: Msg[] }
export const TICKET_CATS = ['诊断问题', '文章与内容', '发布订单', '充值与发票', '账号与品牌', '其他'] as const
export const TICKET_STATUS = { open: '处理中', wait: '待你回复', solved: '已解决' } as const
export const TICKETS: Ticket[] = [
  {
    id: 'T-1042', subject: '订单有 1 篇没有上线', category: '发布订单', status: 'wait', updated: '9月21日 15:30', related: 'PO-0920',
    msgs: [
      { from: 'system', text: '工单已创建，已关联订单 PO-0920', time: '9月21日 10:02' },
      { from: 'me', text: '订单 PO-0920 里有一家媒体一直没上线，是什么原因？', time: '9月21日 10:02' },
      { from: 'system', text: '客服已接手', time: '9月21日 10:20' },
      { from: 'agent', text: '该媒体对稿件中的联系方式有限制，已为你重新提交。可以补充一下希望保留的联系方式吗？', time: '9月21日 15:30' },
    ],
  },
  {
    id: 'T-0987', subject: '想开发票', category: '充值与发票', status: 'solved', updated: '9月15日 11:00',
    msgs: [
      { from: 'me', text: '3,000 积分的充值可以开发票吗？', time: '9月15日 09:20' },
      { from: 'agent', text: '可以，在积分页的“发票记录”申请即可，电子发票 1 个工作日内发送。', time: '9月15日 11:00' },
    ],
  },
]
export const FAQ: { group: string; items: { q: string; a: string }[] }[] = [
  { group: '诊断', items: [
    { q: '诊断要多久？', a: '通常 3–5 分钟。我们会向 5 个平台各提 4 个问题，每个问题采样多次后汇总。' },
    { q: '为什么同一资料只能成功诊断一次？', a: '资料不变时结果基本一致。修改资料后可以再诊断一次。' },
  ] },
  { group: '文章', items: [
    { q: '确认后还能修改文章吗？', a: '可以。修改后文章会回到草稿，需要重新确认才能发布。' },
    { q: '重新生成会覆盖当前内容吗？', a: '会。生成前我们会提示，你可以先复制保存。' },
  ] },
  { group: '发布与订单', items: [
    { q: '订单提交后可以取消吗？', a: '不可以。订单结束后 72 小时内结算，未上线的篇数退回积分。' },
    { q: '随机发布会发到哪些媒体？', a: '下单时只给出媒体类型和预计天数，不指定具体媒体。运维发布后，上线的媒体和链接会同步到订单详情。' },
    { q: '预计上线时间怎么算？', a: '从提交订单起算，含媒体审核。超过上限仍未上线的篇数会退回。' },
  ] },
  { group: '充值与发票', items: [
    { q: '积分怎么换算？', a: '1 元 = 10 积分，支持支付宝与微信支付。' },
    { q: '待支付的订单保留多久？', a: '15 分钟，超时自动关闭，可重新发起。' },
  ] },
]

export const mediaName = (id: string) => mediaById(id).name
