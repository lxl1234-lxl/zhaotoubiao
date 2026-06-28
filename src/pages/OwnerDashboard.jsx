import { useState } from 'react'
import { Link } from 'react-router-dom'
import { tenderService, bidService, announcementService } from '../services/storage'
import { TenderStageBadge, BidStatusBadge } from '../components/StatusBadge'
import { formatMoney, formatDate, getTenderStage } from '../utils/helpers'
import { TENDER_STAGE, TENDER_STAGE_LABEL, BID_STATUS, ANNOUNCEMENT_TYPE, TENDER_CATEGORIES } from '../utils/constants'

export function OwnerDashboard({ user }) {
  const [refresh, setRefresh] = useState(0)
  const tenders = tenderService.getAll().filter((t) => t.ownerId === user.id)

  const advanceStage = (tender) => {
    const stageOrder = [
      TENDER_STAGE.ANNOUNCED, TENDER_STAGE.REGISTRATION,
      TENDER_STAGE.BIDDING, TENDER_STAGE.OPENING,
      TENDER_STAGE.EVALUATION, TENDER_STAGE.CANDIDATE,
      TENDER_STAGE.AWARDED,
    ]
    const currentIdx = stageOrder.indexOf(tender.stage)
    if (currentIdx < stageOrder.length - 1) {
      tender.stage = stageOrder[currentIdx + 1]
      if (tender.stage === TENDER_STAGE.OPENING) {
        tender.deadline = new Date().toISOString()
        const bids = bidService.getByTenderId(tender.id)
        bids.forEach((b) => { if (b.status === BID_STATUS.SUBMITTED) { b.status = BID_STATUS.PENDING; bidService.update(b) } })
      }
      tenderService.update(tender)
      setRefresh((r) => r + 1)
    }
  }

  const handleAward = (tender, bid) => {
    tender.stage = TENDER_STAGE.AWARDED
    tender.winnerBidId = bid.id
    tenderService.update(tender)
    const bids = bidService.getByTenderId(tender.id)
    bids.forEach((b) => {
      b.status = b.id === bid.id ? BID_STATUS.WON : BID_STATUS.LOST
      bidService.update(b)
    })
    const ann = {
      id: Date.now().toString(36),
      tenderId: tender.id,
      type: ANNOUNCEMENT_TYPE.RESULT,
      title: `${tender.title} — 中标结果公告`,
      content: `根据评标结果，确定${bid.bidderName}为中标人，中标金额为￥${bid.price.toLocaleString('zh-CN')}元。\n\n招标人：${tender.ownerName}\n公告日期：${new Date().toLocaleDateString('zh-CN')}`,
      createdAt: new Date().toISOString(),
    }
    announcementService.create(ann)
    setRefresh((r) => r + 1)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">招标管理</h1>
        <Link to="/publish" className="bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition text-sm font-medium">
          + 发布招标
        </Link>
      </div>

      {tenders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200 text-gray-500">您还没有发布任何招标项目</div>
      ) : (
        <div className="space-y-4">
          {tenders.map((tender) => (
            <OwnerTenderCard
              key={`${tender.id}-${refresh}`}
              tender={tender}
              onAdvance={() => advanceStage(tender)}
              onAward={(bid) => handleAward(tender, bid)}
              onSetCandidate={(bid) => {
                tender.stage = TENDER_STAGE.CANDIDATE
                tender.winnerBidId = bid.id
                tender.candidateEndDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
                tenderService.update(tender)
                bid.status = BID_STATUS.CANDIDATE
                bidService.update(bid)
                setRefresh((r) => r + 1)
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function OwnerTenderCard({ tender, onAdvance, onAward, onSetCandidate }) {
  const stage = getTenderStage(tender)
  const bids = bidService.getByTenderId(tender.id)
  const category = TENDER_CATEGORIES.find((c) => c.value === tender.category)
  const [showBids, setShowBids] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [scores, setScores] = useState({})
  const [editingTender, setEditingTender] = useState({ ...tender })

  const canAdvance = [
    TENDER_STAGE.ANNOUNCED, TENDER_STAGE.REGISTRATION,
    TENDER_STAGE.BIDDING, TENDER_STAGE.OPENING,
    TENDER_STAGE.EVALUATION, TENDER_STAGE.CANDIDATE,
  ].includes(stage)

  const canScore = stage === TENDER_STAGE.EVALUATION

  const handleSaveEdit = () => {
    tenderService.update({ ...tender, ...editingTender })
    setEditMode(false)
    window.location.reload()
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
      {editMode ? (
        <div className="space-y-3">
          <div className="flex flex-col md:flex-row gap-3">
            <input type="text" value={editingTender.title} onChange={(e) => setEditingTender((p) => ({ ...p, title: e.target.value }))}
              className="flex-1 px-3 py-1.5 border rounded text-sm" />
            <input type="number" value={editingTender.budget} onChange={(e) => setEditingTender((p) => ({ ...p, budget: Number(e.target.value) }))}
              className="w-40 px-3 py-1.5 border rounded text-sm" />
          </div>
          <div className="flex gap-2">
            <button onClick={handleSaveEdit} className="bg-blue-700 text-white px-3 py-1 rounded text-sm">保存</button>
            <button onClick={() => setEditMode(false)} className="bg-gray-100 px-3 py-1 rounded text-sm">取消</button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <TenderStageBadge stage={stage} />
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{category?.label}</span>
            </div>
            <Link to={`/tender/${tender.id}`} className="text-lg font-semibold text-gray-900 hover:text-blue-600">{tender.title}</Link>
            <p className="text-sm text-gray-500 mt-1">
              预算 {formatMoney(tender.budget)} · 开标 {formatDate(tender.deadline)} · 投标 {bids.length}份
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setEditMode(true)} className="text-xs text-gray-500 hover:text-gray-700">编辑</button>
            <button onClick={() => setShowBids(!showBids)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              {showBids ? '收起' : `查看投标(${bids.length})`}
            </button>
            {canAdvance && (
              <button onClick={onAdvance} className="bg-blue-700 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-800 transition">
                {stage === TENDER_STAGE.CANDIDATE ? '确认定标' : `进入下一阶段 →`}
              </button>
            )}
          </div>
        </div>
      )}

      {showBids && (
        <div className="mt-4 border-t border-gray-100 pt-4">
          {bids.length === 0 ? (
            <p className="text-sm text-gray-500">暂无投标</p>
          ) : (
            <div className="space-y-3">
              {bids.map((bid) => (
                <BidItem
                  key={bid.id}
                  bid={bid}
                  stage={stage}
                  scores={scores}
                  setScores={setScores}
                  canScore={canScore}
                  onAward={() => onAward(bid)}
                  onSetCandidate={() => onSetCandidate(bid)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function BidItem({ bid, stage, scores, setScores, canScore, onAward, onSetCandidate }) {
  const [showDetail, setShowDetail] = useState(false)
  const priceScore = Number(scores[`price_${bid.id}`]) || 0
  const techScore = Number(scores[`tech_${bid.id}`]) || 0
  const qualScore = Number(scores[`qual_${bid.id}`]) || 0
  const totalScore = priceScore + techScore + qualScore

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium text-gray-900">{bid.bidderName}</p>
            <BidStatusBadge status={bid.status} />
          </div>
          <p className="text-sm text-gray-600">报价：{formatMoney(bid.price)}</p>
          <p className="text-sm text-gray-500">联系人：{bid.contactName} · {bid.contactPhone}</p>
          {showDetail && (
            <div className="mt-2 text-sm text-gray-600 bg-white rounded p-3">
              <p className="font-medium mb-1">商务条款：</p>
              <p className="whitespace-pre-wrap">{bid.commercialDoc || '未填写'}</p>
              <p className="font-medium mt-2 mb-1">技术方案：</p>
              <p className="whitespace-pre-wrap">{bid.techProposal || '未填写'}</p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {stage === TENDER_STAGE.CANDIDATE && (
            <button onClick={onAward}
              className="bg-green-600 text-white px-3 py-1.5 rounded text-sm hover:bg-green-700 transition">确定中标</button>
          )}
          {canScore && (
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1">
                <input type="number" min="0" max="40" placeholder="价格" value={scores[`price_${bid.id}`] || ''}
                  onChange={(e) => setScores((p) => ({ ...p, [`price_${bid.id}`]: e.target.value }))}
                  className="w-16 px-1 py-0.5 border rounded text-xs" />
                <input type="number" min="0" max="35" placeholder="技术" value={scores[`tech_${bid.id}`] || ''}
                  onChange={(e) => setScores((p) => ({ ...p, [`tech_${bid.id}`]: e.target.value }))}
                  className="w-16 px-1 py-0.5 border rounded text-xs" />
                <input type="number" min="0" max="25" placeholder="资质" value={scores[`qual_${bid.id}`] || ''}
                  onChange={(e) => setScores((p) => ({ ...p, [`qual_${bid.id}`]: e.target.value }))}
                  className="w-16 px-1 py-0.5 border rounded text-xs" />
                <span className="text-xs font-bold text-gray-700">={totalScore}</span>
              </div>
              <button onClick={onSetCandidate}
                className="bg-pink-100 text-pink-700 px-2 py-1 rounded text-xs hover:bg-pink-200">设为候选人</button>
            </div>
          )}
          <button onClick={() => setShowDetail(!showDetail)}
            className="text-xs text-gray-500 hover:text-gray-700">{showDetail ? '收起详情' : '查看详情'}</button>
        </div>
      </div>
    </div>
  )
}
