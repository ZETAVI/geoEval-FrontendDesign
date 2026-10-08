export type Feature = { name: string; detail: string }
export type Place = { name: string; full: string; district: string }
export type Profile = {
  industry: [string, string] | null; industryNote: string
  company: string; address: string; addressOk: boolean
  product: string; features: Feature[]
  contact: string; phone: string
  lo: number; hi: number; negotiable: boolean
  customers: string[]; positioning: string; background: string
}

export const INDUSTRY: Record<string, string[]> = {
  生活服务: ['家政保洁', '维修安装', '搬家搬运', '美容美发', '美甲美睫', '洗衣洗护', '宠物服务', '汽车服务', '其他'],
  教育培训: ['K12 辅导', '学前早教', '职业技能', '兴趣培训', '语言培训', '艺术培训', '体育培训', '其他'],
  餐饮美食: ['中餐', '火锅烧烤', '烘焙甜点', '茶饮咖啡', '小吃快餐', '西餐', '其他'],
  医疗健康: ['口腔', '体检', '中医理疗', '康复护理', '心理咨询', '其他'],
  亲子母婴: ['月子护理', '母婴用品', '儿童摄影', '亲子乐园', '其他'],
  休闲娱乐: ['健身运动', '瑜伽舞蹈', '密室剧本杀', '桌游棋牌', '其他'],
  婚庆摄影: ['婚礼策划', '婚纱摄影', '写真摄影', '其他'],
  本地零售: ['便利店', '鲜花礼品', '服饰鞋包', '家居建材', '其他'],
  其他: ['其他'],
}
export const PLACES: Place[] = [
  { name: '张杨路 500 号', full: '上海市浦东新区张杨路 500 号', district: '浦东新区 · 陆家嘴' },
  { name: '世纪大道 1568 号', full: '上海市浦东新区世纪大道 1568 号', district: '浦东新区 · 世纪公园' },
  { name: '漕溪北路 398 号', full: '上海市徐汇区漕溪北路 398 号', district: '徐汇区 · 徐家汇' },
  { name: '沪闵路 6088 号', full: '上海市闵行区莘庄镇沪闵路 6088 号', district: '闵行区 · 莘庄' },
]
export const placeOf = (full: string) => PLACES.find((x) => x.full === full)
export const FEATURE_SUGGEST = ['上门流程规范', '阿姨培训到位', '价格透明', '服务有保障', '响应速度快', '本地 10 年经验']
export const CUSTOMERS = ['双职工家庭', '有新生儿的家庭', '独居老人的子女', '租房白领', '企业办公室']
export const POSITIONING = ['高端品质', '性价比', '专业专注', '本地口碑']
export const PRICE = { min: 10, max: 1000, step: 10, presets: [[10, 100], [100, 300], [300, 600], [600, 1000]] as [number, number][] }

export const FULL: Profile = {
  industry: ['生活服务', '家政保洁'], industryNote: '',
  company: '青禾家政服务有限公司', address: PLACES[0].full, addressOk: true,
  product: '日常保洁、深度保洁、保姆与钟点工、月嫂与母婴护理',
  features: [
    { name: '上门流程规范', detail: '预约、到家、验收三步，全程留痕' },
    { name: '阿姨培训到位', detail: '上岗前 40 小时实操培训，持证上岗率 100%' },
  ],
  contact: '陈经理', phone: '13800001234',
  lo: 40, hi: 120, negotiable: false,
  customers: ['双职工家庭', '有新生儿的家庭'], positioning: '本地口碑', background: '2016 年成立，团队 120 人，累计服务 3 万户家庭。',
}
export const EMPTY: Profile = {
  industry: null, industryNote: '', company: '', address: '', addressOk: false, product: '', features: [], contact: '', phone: '',
  lo: 40, hi: 120, negotiable: false, customers: [], positioning: '', background: '',
}

export type Item = { key: string; label: string; ok: boolean; tier: 'must' | 'plus'; anchor: string }
export const checklist = (p: Profile): Item[] => [
  { key: 'industry', label: '所属行业', ok: !!p.industry && !!p.industry[1] && (p.industry[1] !== '其他' || p.industryNote.trim().length >= 2), tier: 'must', anchor: 'f-industry' },
  { key: 'company', label: '公司名称', ok: p.company.trim().length >= 2, tier: 'must', anchor: 'f-company' },
  { key: 'address', label: '公司地址', ok: p.addressOk, tier: 'must', anchor: 'f-address' },
  { key: 'product', label: '主营产品', ok: p.product.trim().length >= 2, tier: 'must', anchor: 'f-product' },
  { key: 'features', label: '品牌特点', ok: p.features.length >= 2, tier: 'must', anchor: 'f-features' },
  { key: 'contact', label: '联系人与手机', ok: p.contact.trim().length >= 1 && /^1\d{10}$/.test(p.phone), tier: 'must', anchor: 'f-contact' },
  { key: 'proof', label: '特点详情', ok: p.features.some((f) => f.detail.trim().length >= 6), tier: 'plus', anchor: 'f-features' },
  { key: 'price', label: '客单价', ok: p.negotiable || p.hi > p.lo, tier: 'plus', anchor: 'f-price' },
  { key: 'customers', label: '目标客户', ok: p.customers.length >= 1, tier: 'plus', anchor: 'f-customers' },
  { key: 'positioning', label: '品牌定位', ok: !!p.positioning, tier: 'plus', anchor: 'f-positioning' },
  { key: 'background', label: '品牌背景', ok: p.background.trim().length >= 10, tier: 'plus', anchor: 'f-background' },
]
export const missingMust = (p: Profile) => checklist(p).filter((i) => i.tier === 'must' && !i.ok)

export const priceText = (p: Profile) => (p.negotiable ? '面议' : `¥${p.lo}–${p.hi}`)
/** 写文章时会引用的资料：值为空表示没填 */
export const facts = (p: Profile) => [
  { key: 'address', label: '服务地址', value: p.address, anchor: 'f-address' },
  { key: 'product', label: '主营产品', value: p.product, anchor: 'f-product' },
  { key: 'features', label: '品牌特点', value: p.features.map((f) => f.name).join('、'), anchor: 'f-features' },
  { key: 'price', label: '客单价', value: priceText(p), anchor: 'f-price' },
  { key: 'customers', label: '目标客户', value: p.customers.join('、'), anchor: 'f-customers' },
  { key: 'positioning', label: '品牌定位', value: p.positioning, anchor: 'f-positioning' },
  { key: 'background', label: '品牌背景', value: p.background, anchor: 'f-background' },
]
