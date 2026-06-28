import { useState } from 'react'
import { Link } from 'react-router-dom'
import { bidService, tenderService } from '../services/storage'
import { BidStatusBadge } from '../components/StatusBadge'
import { formatMoney, formatDate, getTenderStage } from '../utils/helpers'

export function BidderDashboard({ user }) {
  const bids = bidService.getByBidderId(user.id)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">我的投标</h1>
      {bids.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200 text-gray-500">
          您还没有提交任何投标
          <div className="mt-3">
            <Link to="/" className="text-blue-600 hover:underline">去浏览招标项目</Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {bids.map((bid) => <BidCard key={bid.id} bid={bid} />)}
        </div>
      )}
    </div>
  )
}

function BidCard({ bid }) {
  const tender = tenderService.getById(bid.tenderId)
  const [showDetail, setShowDetail] = useState(false)

  if (!tender) {
    return <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5"><p className="text-sm text-gray-500">关联的项目已删除</p></div>
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <BidStatusBadge status={bid.status} />
            <span className="text-xs text-gray-400">{formatDate(bid.createdAt)}</span>
          </div>
          <Link to={`/tender/${tender.id}`} className="text-lg font-semibold text-gray-900 hover:text-blue-600">{tender.title}</Link>
          <div className="flex flex-wrap gap-x-6 gap-y-1 mt-2 text-sm text-gray-500">
            <span>招标方：{tender.ownerName}</span>
            <span>预算：{formatMoney(tender.budget)}</span>
            <span>我的报价：<span className="font-semibold text-blue-700">{formatMoney(bid.price)}</span></span>
          </div>
          {showDetail && (
            <div className="mt-3 text-sm space-y-2">
              <div className="bg-gray-50 rounded p-3">
                <p className="font-medium text-gray-700 mb-1">商务条款：</p>
                <p className="text-gray-600 whitespace-pre-wrap">{bid.commercialDoc || '未填写'}</p>
              </div>
              <div className="bg-gray-50 rounded p-3">
                <p className="font-medium text-gray-700 mb-1">技术方案：</p>
                <p className="text-gray-600 whitespace-pre-wrap">{bid.techProposal || '未填写'}</p>
              </div>
            </div>
          )}
        </div>
        <div className="flex items-start gap-3">
          <button onClick={() => setShowDetail(!showDetail)} className="text-sm text-blue-600 hover:text-blue-800">{showDetail ? '收起' : '查看详情'}</button>
          <Link to={`/tender/${tender.id}`} className="text-sm text-gray-500 hover:text-gray-700">查看项目</Link>
        </div>
      </div>
    </div>
  )
}
