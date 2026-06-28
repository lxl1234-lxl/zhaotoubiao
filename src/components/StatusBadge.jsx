import { TENDER_STAGE_LABEL, TENDER_STAGE_STYLE, BID_STATUS_LABEL, BID_STATUS_STYLE } from '../utils/constants'

export function TenderStageBadge({ stage }) {
  return (
    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${TENDER_STAGE_STYLE[stage] || 'bg-gray-100 text-gray-800'}`}>
      {TENDER_STAGE_LABEL[stage] || stage}
    </span>
  )
}

export function BidStatusBadge({ status }) {
  return (
    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${BID_STATUS_STYLE[status] || 'bg-gray-100 text-gray-800'}`}>
      {BID_STATUS_LABEL[status] || status}
    </span>
  )
}
