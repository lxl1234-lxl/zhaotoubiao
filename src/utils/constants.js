export const TENDER_CATEGORIES = [
  { value: 'engineering', label: '工程建筑' },
  { value: 'goods', label: '货物采购' },
  { value: 'service', label: '服务采购' },
  { value: 'it', label: '信息技术' },
  { value: 'medical', label: '医疗器械' },
  { value: 'land', label: '土地交易' },
  { value: 'property', label: '产权交易' },
  { value: 'other', label: '其他' },
]

export const TENDER_METHODS = [
  { value: 'open', label: '公开招标' },
  { value: 'invite', label: '邀请招标' },
]

export const TENDER_METHOD_LABEL = {
  open: '公开招标',
  invite: '邀请招标',
}

export const ROLES = { OWNER: 'owner', BIDDER: 'bidder' }

export const ROLES_LABEL = { [ROLES.OWNER]: '招标方', [ROLES.BIDDER]: '投标方' }

export const TENDER_STAGE = {
  ANNOUNCED: 'announced', REGISTRATION: 'registration',
  PREQUALIFICATION: 'prequalification', BIDDING: 'bidding',
  OPENING: 'opening', EVALUATION: 'evaluation',
  CANDIDATE: 'candidate', AWARDED: 'awarded', TERMINATED: 'terminated',
}

export const TENDER_STAGE_LABEL = {
  [TENDER_STAGE.ANNOUNCED]: '公告发布', [TENDER_STAGE.REGISTRATION]: '报名阶段',
  [TENDER_STAGE.PREQUALIFICATION]: '资格预审', [TENDER_STAGE.BIDDING]: '投标中',
  [TENDER_STAGE.OPENING]: '开标', [TENDER_STAGE.EVALUATION]: '评标中',
  [TENDER_STAGE.CANDIDATE]: '中标公示', [TENDER_STAGE.AWARDED]: '已定标',
  [TENDER_STAGE.TERMINATED]: '已终止',
}

export const TENDER_STAGE_STYLE = {
  [TENDER_STAGE.ANNOUNCED]: 'bg-blue-100 text-blue-800',
  [TENDER_STAGE.REGISTRATION]: 'bg-indigo-100 text-indigo-800',
  [TENDER_STAGE.PREQUALIFICATION]: 'bg-purple-100 text-purple-800',
  [TENDER_STAGE.BIDDING]: 'bg-green-100 text-green-800',
  [TENDER_STAGE.OPENING]: 'bg-yellow-100 text-yellow-800',
  [TENDER_STAGE.EVALUATION]: 'bg-orange-100 text-orange-800',
  [TENDER_STAGE.CANDIDATE]: 'bg-pink-100 text-pink-800',
  [TENDER_STAGE.AWARDED]: 'bg-teal-100 text-teal-800',
  [TENDER_STAGE.TERMINATED]: 'bg-gray-200 text-gray-600',
}

export const TENDER_STAGE_ORDER = [
  TENDER_STAGE.ANNOUNCED, TENDER_STAGE.REGISTRATION,
  TENDER_STAGE.PREQUALIFICATION, TENDER_STAGE.BIDDING,
  TENDER_STAGE.OPENING, TENDER_STAGE.EVALUATION,
  TENDER_STAGE.CANDIDATE, TENDER_STAGE.AWARDED,
]

export const BID_STATUS = {
  REGISTERED: 'registered', QUALIFIED: 'qualified',
  SUBMITTED: 'submitted', PENDING: 'pending',
  WON: 'won', LOST: 'lost', CANDIDATE: 'candidate',
}

export const BID_STATUS_LABEL = {
  [BID_STATUS.REGISTERED]: '已报名', [BID_STATUS.QUALIFIED]: '已过审',
  [BID_STATUS.SUBMITTED]: '已投标', [BID_STATUS.PENDING]: '待开标',
  [BID_STATUS.WON]: '中标', [BID_STATUS.LOST]: '未中标',
  [BID_STATUS.CANDIDATE]: '候选人',
}

export const BID_STATUS_STYLE = {
  [BID_STATUS.REGISTERED]: 'bg-blue-100 text-blue-800',
  [BID_STATUS.QUALIFIED]: 'bg-purple-100 text-purple-800',
  [BID_STATUS.SUBMITTED]: 'bg-indigo-100 text-indigo-800',
  [BID_STATUS.PENDING]: 'bg-gray-100 text-gray-800',
  [BID_STATUS.WON]: 'bg-green-100 text-green-800',
  [BID_STATUS.LOST]: 'bg-red-100 text-red-800',
  [BID_STATUS.CANDIDATE]: 'bg-pink-100 text-pink-800',
}

export const ANNOUNCEMENT_TYPE = {
  TENDER: 'tender', CHANGE: 'change', CLARIFY: 'clarify',
  CANDIDATE: 'candidate', RESULT: 'result', TERMINATE: 'terminate',
}

export const ANNOUNCEMENT_TYPE_LABEL = {
  [ANNOUNCEMENT_TYPE.TENDER]: '招标公告', [ANNOUNCEMENT_TYPE.CHANGE]: '变更公告',
  [ANNOUNCEMENT_TYPE.CLARIFY]: '答疑澄清', [ANNOUNCEMENT_TYPE.CANDIDATE]: '中标候选人公示',
  [ANNOUNCEMENT_TYPE.RESULT]: '中标结果公告', [ANNOUNCEMENT_TYPE.TERMINATE]: '终止公告',
}

export const STORAGE_KEYS = {
  USERS: 'tender_users', CURRENT_USER: 'tender_current_user',
  TENDERS: 'tender_tenders', BIDS: 'tender_bids',
  ANNOUNCEMENTS: 'tender_announcements', INITED: 'tender_inited_v2',
}
