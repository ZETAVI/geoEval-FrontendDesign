/* 诊断数据与口径：5 个平台 × 4 个问题 = 20 条采样。
   我们不判断“是否推荐”，只记录品牌在回答列表中的排位，并由排位推出推荐程度。 */
export const BRAND = '青禾家政'

export type Kind = 'find' | 'ask'
export const KIND_LABEL: Record<Kind, string> = { find: '找品牌', ask: '问到你' }

export const QUESTIONS: { text: string; kind: Kind }[] = [
  { text: '上海浦东有哪些靠谱的家政公司？', kind: 'find' },
  { text: '家里深度保洁找哪家比较好？', kind: 'find' },
  { text: `${BRAND}怎么样，值得选吗？`, kind: 'ask' },
  { text: '上海性价比高的保姆中介推荐', kind: 'find' },
]
export const PLATFORM_NAMES = ['豆包', 'DeepSeek', 'Kimi', '文心一言', '通义千问']

export type Tier = 'top' | 'mid' | 'low' | 'none'
export const tierOf = (rank: number | null): Tier => (rank == null ? 'none' : rank <= 3 ? 'top' : rank <= 5 ? 'mid' : 'low')

/** 推荐程度：颜色深浅 = 排位靠前程度；未提及用虚线空心 */
export const TIER: Record<Tier, { label: string; hint: string; cell: string; chip: string }> = {
  top: { label: '靠前', hint: '排在前三位，用户更容易选你', cell: 'bg-orange text-orange-ink', chip: 'bg-orange text-orange-ink' },
  mid: { label: '居中', hint: '排在第 4–5 位，容易被略过', cell: 'bg-orange-soft text-orange-ink ring-1 ring-inset ring-orange/70', chip: 'bg-orange-soft text-orange-ink' },
  low: { label: '靠后', hint: '排在第 6 位之后，很少被注意', cell: 'bg-surface text-orange-ink ring-1 ring-inset ring-orange/40', chip: 'bg-surface text-orange-ink ring-1 ring-inset ring-orange/40' },
  none: { label: '未提及', hint: '这条回答里没有你', cell: 'border border-dashed border-mark bg-transparent text-ink-3', chip: 'bg-sunken text-ink-2' },
}

export type Sample = { rank: number | null; total: number; note?: string }
const s = (rank: number, total: number, note: string): Sample => ({ rank, total, note })
const none: Sample = { rank: null, total: 5 }

/** 行 = 平台，列 = 问题 */
export const SAMPLES: Sample[][] = [
  [s(3, 8, '上门流程规范，服务前会确认清单，适合浦东家庭。'), s(5, 8, '深度保洁有固定清单，但公开报价较少。'), s(2, 4, '本地家政公司，流程规范，服务范围没有写清。'), none],
  [s(7, 8, '一家本地家政公司，公开信息较少。'), none, s(2, 3, '一家本地家政公司，线上评价较少。'), none],
  [none, none, s(3, 5, '阿姨培训到位，但服务区域不明确。'), none],
  [none, none, none, none],
  [none, none, none, none],
]

const POOL = ['阿姨帮', '管家帮', '天鹅到家', '好慷在家', '万家保洁', '家政通', '一号家政', '邻里保洁']
const NOTES: Record<string, string> = {
  阿姨帮: '规模大，覆盖全市。',
  管家帮: '适合长期保姆需求。',
  天鹅到家: '平台型，选择多。',
  好慷在家: '钟点工响应快。',
  万家保洁: '保洁项目齐全。',
  家政通: '价格区间清晰。',
  一号家政: '月嫂服务口碑好。',
  邻里保洁: '社区门店，就近上门。',
}

/** 还原这条回答里的品牌列表 */
export function answerList(smp: Sample) {
  const others = POOL.slice()
  return Array.from({ length: smp.total }, (_, i) => {
    if (smp.rank === i + 1) return { name: BRAND, note: smp.note ?? '', me: true }
    const name = others.shift() ?? '其他品牌'
    return { name, note: NOTES[name] ?? '服务覆盖多个区域。', me: false }
  })
}

/* ── 指标 ── */
const flat = SAMPLES.flatMap((row, p) => row.map((x, q) => ({ ...x, p, q })))
const hits = flat.filter((x) => x.rank != null)
const findAll = flat.filter((x) => QUESTIONS[x.q].kind === 'find')
const findHits = findAll.filter((x) => x.rank != null)

export const METRICS = {
  total: flat.length,
  mentions: hits.length,
  mentionRate: Math.round((hits.length / flat.length) * 100),
  platformsHit: SAMPLES.filter((row) => row.some((x) => x.rank != null)).length,
  platforms: SAMPLES.length,
  avgRank: hits.reduce((a, x) => a + (x.rank ?? 0), 0) / hits.length,
  topCount: hits.filter((x) => tierOf(x.rank) === 'top').length,
  findRate: Math.round((findHits.length / findAll.length) * 100),
  findHits: findHits.length,
  findTotal: findAll.length,
  askHits: hits.length - findHits.length,
  askTotal: flat.length - findAll.length,
}

export const bestRank = (p: number) => {
  const r = SAMPLES[p].map((x) => x.rank).filter((x): x is number => x != null)
  return r.length ? Math.min(...r) : null
}
export const questionHits = (q: number) => SAMPLES.filter((row) => row[q].rank != null).length
