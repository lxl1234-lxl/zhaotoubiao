import { TENDER_STAGE } from './constants'

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
}

export function formatDate(dateStr) {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatDateShort(dateStr) {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

export function formatMoney(amount) {
  if (amount === undefined || amount === null || amount === '') return '-'
  return Number(amount).toLocaleString('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 0,
  })
}

export function getTenderStage(tender) {
  if (tender.stage === TENDER_STAGE.TERMINATED) return TENDER_STAGE.TERMINATED
  const now = new Date()

  if (tender.stage === TENDER_STAGE.AWARDED) return TENDER_STAGE.AWARDED
  if (tender.stage === TENDER_STAGE.CANDIDATE && tender.candidateEndDate && new Date(tender.candidateEndDate) < now) {
    return TENDER_STAGE.CANDIDATE
  }

  if (tender.stage) return tender.stage

  const deadline = new Date(tender.deadline)
  if (deadline > now) return TENDER_STAGE.BIDDING
  return TENDER_STAGE.EVALUATION
}

export function getCountdown(dateStr) {
  if (!dateStr) return null
  const now = new Date()
  const target = new Date(dateStr)
  const diff = target - now
  if (diff <= 0) return null
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  if (days > 0) return `${days}天${hours}小时`
  return `${hours}小时${Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))}分钟`
}

export function canBid(tender) {
  const stage = getTenderStage(tender)
  return stage === TENDER_STAGE.BIDDING || stage === TENDER_STAGE.ANNOUNCED || stage === TENDER_STAGE.REGISTRATION
}
