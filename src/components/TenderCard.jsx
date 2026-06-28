import { Link } from 'react-router-dom'
import { TenderStageBadge } from './StatusBadge'
import { formatMoney, formatDate, getCountdown, getTenderStage } from '../utils/helpers'
import { TENDER_CATEGORIES, TENDER_METHOD_LABEL, TENDER_STAGE, ANNOUNCEMENT_TYPE, ANNOUNCEMENT_TYPE_LABEL } from '../utils/constants'

export function TenderCard({ tender }) {
  const stage = getTenderStage(tender)
  const category = TENDER_CATEGORIES.find((c) => c.value === tender.category)
  const countdown = getCountdown(tender.deadline)

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition p-5">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <TenderStageBadge stage={stage} />
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{category?.label || tender.category}</span>
            <span className="text-xs text-gray-400">{TENDER_METHOD_LABEL[tender.method] || '公开招标'}</span>
          </div>
          <Link to={`/tender/${tender.id}`} className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition">
            {tender.title}
          </Link>
          <p className="text-gray-600 text-sm mt-2 line-clamp-2">{tender.description}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="text-right">
            <p className="text-blue-700 font-bold text-lg">{formatMoney(tender.budget)}</p>
            <p className="text-xs text-gray-500">预算金额</p>
          </div>
          {countdown && (
            <div className="bg-red-50 text-red-600 text-xs px-2 py-1 rounded font-medium">
              截标倒计时 {countdown}
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between mt-4 pt-4 border-t border-gray-100 text-sm text-gray-500 gap-2">
        <div className="flex flex-wrap items-center gap-4">
          <span>招标方：{tender.ownerName || '-'}</span>
          <span>报名截止：{formatDate(tender.registrationDeadline || tender.deadline)}</span>
          <span>开标：{formatDate(tender.deadline)}</span>
        </div>
        <Link to={`/tender/${tender.id}`} className="text-blue-600 hover:text-blue-800 font-medium">查看详情 →</Link>
      </div>
    </div>
  )
}

export function StatusBadgeComponent() {
  return null
}
