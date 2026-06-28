import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { tenderService, bidService, announcementService } from '../services/storage'
import { TenderStageBadge, BidStatusBadge } from '../components/StatusBadge'
import { formatMoney, formatDate, formatDateShort, getCountdown, getTenderStage } from '../utils/helpers'
import { ROLES, TENDER_CATEGORIES, TENDER_METHOD_LABEL, TENDER_STAGE, TENDER_STAGE_LABEL, TENDER_STAGE_ORDER, ANNOUNCEMENT_TYPE, ANNOUNCEMENT_TYPE_LABEL } from '../utils/constants'

export function TenderDetailPage({ user }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const tender = tenderService.getById(id)

  if (!tender) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
        <p className="text-gray-500">招标项目不存在</p>
        <Link to="/" className="text-blue-600 hover:underline mt-2 inline-block">返回首页</Link>
      </div>
    )
  }

  const stage = getTenderStage(tender)
  const category = TENDER_CATEGORIES.find((c) => c.value === tender.category)
  const bids = bidService.getByTenderId(tender.id)
  const announcements = announcementService.getByTenderId(tender.id)
  const myBid = user?.role === ROLES.BIDDER ? bids.find((b) => b.bidderId === user.id) : null
  const isOwner = user?.role === ROLES.OWNER && tender.ownerId === user.id
  const countdown = getCountdown(tender.deadline)
  const currentStageIdx = TENDER_STAGE_ORDER.indexOf(stage)

  const canRegister = [TENDER_STAGE.ANNOUNCED, TENDER_STAGE.REGISTRATION].includes(stage)
  const winner = tender.winnerBidId ? bids.find((b) => b.id === tender.winnerBidId) : null

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 md:p-8">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <TenderStageBadge stage={stage} />
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{category?.label || tender.category}</span>
            <span className="text-sm text-gray-400">{TENDER_METHOD_LABEL[tender.method] || '公开招标'}</span>
            {countdown && (
              <span className="text-sm bg-red-50 text-red-600 px-2 py-0.5 rounded font-medium">截标倒计时 {countdown}</span>
            )}
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">{tender.title}</h1>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <InfoItem label="预算金额" value={formatMoney(tender.budget)} highlight />
            <InfoItem label="保证金" value={tender.depositAmount ? formatMoney(tender.depositAmount) : '无'} />
            <InfoItem label="报名截止" value={formatDate(tender.registrationDeadline || tender.deadline)} />
            <InfoItem label="开标时间" value={formatDate(tender.deadline)} />
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">项目描述</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{tender.description}</p>
          </div>

          <div className="flex flex-wrap gap-4 mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">联系方式</h2>
              <p className="text-gray-700">联系人：{tender.contactName || '-'}</p>
              <p className="text-gray-700">电话：{tender.contactPhone || '-'}</p>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">招标方</h2>
              <p className="text-gray-700">{tender.ownerName || '-'}</p>
              <p className="text-gray-500 text-sm">发布时间 {formatDate(tender.createdAt)}</p>
            </div>
          </div>

          {(stage === TENDER_STAGE.AWARDED || stage === TENDER_STAGE.CANDIDATE) && winner && (
            <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-100">
              <h2 className="text-lg font-semibold text-green-900 mb-2">中标信息</h2>
              <p className="text-green-800">中标方：{winner.bidderName}</p>
              <p className="text-green-800">中标金额：{formatMoney(winner.price)}</p>
            </div>
          )}

          <div className="flex flex-wrap gap-3 pt-6 border-t border-gray-100">
            {user?.role === ROLES.BIDDER && !myBid && canRegister && (
              <button onClick={() => navigate(`/bid/${tender.id}`)} className="bg-blue-700 text-white px-6 py-2.5 rounded-lg hover:bg-blue-800 transition font-medium">
                我要投标
              </button>
            )}
            {user?.role === ROLES.BIDDER && myBid && (
              <div className="bg-green-50 text-green-700 px-4 py-2.5 rounded-lg text-sm">
                您已投标 · <BidStatusBadge status={myBid.status} />
              </div>
            )}
            {isOwner && (
              <Link to="/owner-dashboard" className="bg-gray-100 text-gray-800 px-6 py-2.5 rounded-lg hover:bg-gray-200 transition font-medium">
                管理投标
              </Link>
            )}
            <Link to="/" className="text-gray-600 px-6 py-2.5 rounded-lg hover:bg-gray-100 transition font-medium">返回列表</Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">招标流程</h2>
          <div className="space-y-0">
            {TENDER_STAGE_ORDER.map((s, idx) => {
              const isActive = TENDER_STAGE_ORDER.indexOf(stage) >= idx
              const isCurrent = s === stage
              const isTerminated = tender.stage === TENDER_STAGE.TERMINATED && idx > currentStageIdx
              return (
                <div key={s} className="flex">
                  <div className="flex flex-col items-center mr-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      isCurrent ? 'bg-blue-700 text-white ring-4 ring-blue-100' :
                      isActive && !isTerminated ? 'bg-blue-500 text-white' :
                      'bg-gray-200 text-gray-500'
                    }`}>
                      {isActive && !isTerminated ? '✓' : idx + 1}
                    </div>
                    {idx < TENDER_STAGE_ORDER.length - 1 && (
                      <div className={`w-0.5 h-8 ${isActive && !isTerminated ? 'bg-blue-500' : 'bg-gray-200'}`} />
                    )}
                  </div>
                  <div className="pb-6">
                    <p className={`text-sm font-medium ${isCurrent ? 'text-blue-700' : isActive && !isTerminated ? 'text-gray-700' : 'text-gray-400'}`}>
                      {TENDER_STAGE_LABEL[s]}
                    </p>
                  </div>
                </div>
              )
            })}
            {tender.stage === TENDER_STAGE.TERMINATED && (
              <div className="flex">
                <div className="flex flex-col items-center mr-4">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold bg-red-500 text-white">✕</div>
                </div>
                <div className="pb-2">
                  <p className="text-sm font-medium text-red-600">已终止</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">招标公告</h2>
          {announcements.length === 0 ? (
            <p className="text-sm text-gray-500">暂无公告</p>
          ) : (
            <div className="space-y-3">
              {announcements.map((ann) => (
                <div key={ann.id} className="border border-gray-100 rounded-lg p-3 hover:bg-gray-50 transition">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-medium">
                      {ANNOUNCEMENT_TYPE_LABEL[ann.type]}
                    </span>
                    <span className="text-xs text-gray-400">{formatDateShort(ann.createdAt)}</span>
                  </div>
                  <p className="text-sm font-medium text-gray-900">{ann.title}</p>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-3 whitespace-pre-wrap">{ann.content}</p>
                </div>
              ))}
            </div>
          )}

          {isOwner && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <OwnerPublishAnnouncement tender={tender} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function InfoItem({ label, value, highlight }) {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className={`font-semibold ${highlight ? 'text-blue-700 text-xl' : 'text-gray-900'}`}>{value}</p>
    </div>
  )
}

function OwnerPublishAnnouncement({ tender }) {
  const [showForm, setShowForm] = useState(false)
  const [type, setType] = useState(ANNOUNCEMENT_TYPE.CHANGE)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  const handleSubmit = () => {
    if (!title || !content) {
      alert('请填写标题和内容')
      return
    }
    const ann = {
      id: Date.now().toString(36),
      tenderId: tender.id,
      type,
      title,
      content,
      createdAt: new Date().toISOString(),
    }
    announcementService.create(ann)
    if (type === ANNOUNCEMENT_TYPE.TERMINATE) {
      tender.stage = TENDER_STAGE.TERMINATED
      tenderService.update(tender)
    }
    setShowForm(false)
    setTitle('')
    setContent('')
    window.location.reload()
  }

  if (!showForm) {
    return (
      <button onClick={() => setShowForm(true)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
        + 发布公告
      </button>
    )
  }

  return (
    <div className="space-y-3">
      <h3 className="font-medium text-gray-900 text-sm">发布公告</h3>
      <select value={type} onChange={(e) => setType(e.target.value)}
        className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 outline-none">
        <option value={ANNOUNCEMENT_TYPE.CHANGE}>变更公告</option>
        <option value={ANNOUNCEMENT_TYPE.CLARIFY}>答疑澄清</option>
        <option value={ANNOUNCEMENT_TYPE.CANDIDATE}>中标候选人公示</option>
        <option value={ANNOUNCEMENT_TYPE.RESULT}>中标结果公告</option>
        <option value={ANNOUNCEMENT_TYPE.TERMINATE}>终止公告</option>
      </select>
      <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
        placeholder="公告标题" className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 outline-none" />
      <textarea value={content} onChange={(e) => setContent(e.target.value)}
        placeholder="公告内容" rows={4}
        className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 outline-none" />
      <div className="flex gap-2">
        <button onClick={handleSubmit} className="bg-blue-700 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-800 transition">发布</button>
        <button onClick={() => setShowForm(false)} className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded text-sm hover:bg-gray-200 transition">取消</button>
      </div>
    </div>
  )
}
