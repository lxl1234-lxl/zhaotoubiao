import { STORAGE_KEYS, ROLES, TENDER_STAGE, BID_STATUS, ANNOUNCEMENT_TYPE } from '../utils/constants'
import { storage, userService, tenderService, bidService, announcementService } from './storage'
import { generateId } from '../utils/helpers'

export function initSampleData() {
  if (storage.get(STORAGE_KEYS.INITED)) return

  const ownerUser = {
    id: generateId(),
    username: 'zhaobiao',
    password: '123456',
    role: ROLES.OWNER,
    companyName: '华夏建设工程有限公司',
    createdAt: new Date().toISOString(),
  }
  const bidderUser = {
    id: generateId(),
    username: 'toubiao',
    password: '123456',
    role: ROLES.BIDDER,
    companyName: '东方智能科技有限公司',
    createdAt: new Date().toISOString(),
  }
  const bidderUser2 = {
    id: generateId(),
    username: 'bidder2',
    password: '123456',
    role: ROLES.BIDDER,
    companyName: '南方建筑工程集团',
    createdAt: new Date().toISOString(),
  }
  userService.create(ownerUser)
  userService.create(bidderUser)
  userService.create(bidderUser2)

  const now = new Date()
  const d1 = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString()
  const d2 = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString()

  const tender1 = {
    id: generateId(),
    title: '智慧园区综合管理平台建设项目',
    category: 'it',
    method: 'open',
    budget: 850000,
    description: '建设一套涵盖园区安防、能源管理、停车管理、访客预约等功能的综合管理平台，要求支持移动端访问，具备良好的扩展性。',
    deadline: d1,
    registrationDeadline: d1,
    contactName: '张经理',
    contactPhone: '13800138000',
    depositAmount: 50000,
    ownerId: ownerUser.id,
    ownerName: ownerUser.companyName,
    createdAt: new Date().toISOString(),
    stage: TENDER_STAGE.BIDDING,
    startTime: new Date().toISOString(),
  }
  const tender2 = {
    id: generateId(),
    title: '办公楼中央空调系统采购及安装',
    category: 'engineering',
    method: 'open',
    budget: 2300000,
    description: '采购并安装多联机中央空调系统，覆盖面积约15000平方米，包含设备、管道、风口及调试服务。',
    deadline: d2,
    registrationDeadline: d2,
    contactName: '李工',
    contactPhone: '13900139000',
    depositAmount: 100000,
    ownerId: ownerUser.id,
    ownerName: ownerUser.companyName,
    createdAt: new Date().toISOString(),
    stage: TENDER_STAGE.REGISTRATION,
    startTime: new Date().toISOString(),
  }
  const tender3 = {
    id: generateId(),
    title: '年度办公用品集中采购',
    category: 'goods',
    method: 'open',
    budget: 120000,
    description: '采购打印机耗材、文具、纸张等办公用品，按季度分批供货，要求正品保障、价格优惠。',
    deadline: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    registrationDeadline: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    contactName: '王主任',
    contactPhone: '13700137000',
    depositAmount: 5000,
    ownerId: ownerUser.id,
    ownerName: ownerUser.companyName,
    createdAt: new Date().toISOString(),
    stage: TENDER_STAGE.AWARDED,
    winnerBidId: '',
    startTime: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  }

  tenderService.create(tender1)
  tenderService.create(tender2)
  tenderService.create(tender3)

  const bid1 = {
    id: generateId(),
    tenderId: tender1.id,
    bidderId: bidderUser.id,
    bidderName: bidderUser.companyName,
    price: 820000,
    techProposal: '本公司拥有10年智慧园区建设经验，已完成20+类似项目。方案采用微服务架构，支持弹性扩展，提供3年免费运维。',
    commercialDoc: '包含详细商务条款、付款计划及质保承诺。',
    contactName: '陈经理',
    contactPhone: '15000150000',
    depositPaid: true,
    status: BID_STATUS.SUBMITTED,
    createdAt: new Date().toISOString(),
  }
  bidService.create(bid1)

  const bidAward = {
    id: generateId(),
    tenderId: tender3.id,
    bidderId: bidderUser.id,
    bidderName: bidderUser.companyName,
    price: 115000,
    techProposal: '正品保证，响应及时，提供月度结账服务。',
    commercialDoc: '含详细的货品清单与配送方案。',
    contactName: '陈经理',
    contactPhone: '15000150000',
    depositPaid: true,
    status: BID_STATUS.WON,
    createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  }
  bidService.create(bidAward)

  tender3.winnerBidId = bidAward.id
  tenderService.update(tender3)

  announcementService.create({
    id: generateId(),
    tenderId: tender1.id,
    type: ANNOUNCEMENT_TYPE.TENDER,
    title: '智慧园区综合管理平台建设项目招标公告',
    content: `1. 招标条件\n本招标项目智慧园区综合管理平台建设项目已批准建设，招标人为${ownerUser.companyName}，资金来源为企业自筹。项目已具备招标条件，现对该项目进行公开招标。\n\n2. 项目概况与招标范围\n建设一套涵盖园区安防、能源管理、停车管理、访客预约等功能的综合管理平台。预算金额：￥850,000元。\n\n3. 投标人资格要求\n3.1 具有独立法人资格\n3.2 具有类似项目经验\n3.3 本项目不接受联合体投标`,
    createdAt: new Date().toISOString(),
  })
  announcementService.create({
    id: generateId(),
    tenderId: tender2.id,
    type: ANNOUNCEMENT_TYPE.TENDER,
    title: '办公楼中央空调系统采购及安装招标公告',
    content: `1. 招标条件\n本招标项目办公楼中央空调系统采购及安装已批准建设，招标人为${ownerUser.companyName}，资金来源为企业自筹。\n\n2. 项目概况与招标范围\n采购并安装多联机中央空调系统，覆盖面积约15000平方米。预算金额：￥2,300,000元。\n\n3. 投标人资格要求\n3.1 具有机电安装工程专业承包资质\n3.2 具有类似项目业绩\n3.3 接受联合体投标`,
    createdAt: new Date().toISOString(),
  })
  announcementService.create({
    id: generateId(),
    tenderId: tender3.id,
    type: ANNOUNCEMENT_TYPE.RESULT,
    title: '年度办公用品集中采购中标结果公告',
    content: `根据评标结果，确定东方智能科技有限公司为中标人，中标金额为￥115,000元。\n\n招标人：${ownerUser.companyName}\n公告日期：${new Date().toLocaleDateString('zh-CN')}`,
    createdAt: new Date().toISOString(),
  })

  storage.set(STORAGE_KEYS.INITED, true)
}
