import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { TenderCard } from '../components/TenderCard'
import { tenderService, announcementService } from '../services/storage'
import { TENDER_CATEGORIES, TENDER_STAGE, TENDER_STAGE_LABEL, ANNOUNCEMENT_TYPE_LABEL } from '../utils/constants'
import { getTenderStage, formatDateShort } from '../utils/helpers'

export function HomePage() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [stage, setStage] = useState('')

  const tenders = tenderService.getAll()
  const announcements = announcementService.getRecent(6)

  const filteredTenders = useMemo(() => {
    return tenders.filter((tender) => {
      const matchSearch = tender.title.toLowerCase().includes(search.toLowerCase())
      const matchCategory = !category || tender.category === category
      const matchStage = !stage || getTenderStage(tender) === stage
      return matchSearch && matchCategory && matchStage
    })
  }, [tenders, search, category, stage])

  const stageOptions = [
    { value: TENDER_STAGE.ANNOUNCED, label: TENDER_STAGE_LABEL[TENDER_STAGE.ANNOUNCED] },
    { value: TENDER_STAGE.REGISTRATION, label: TENDER_STAGE_LABEL[TENDER_STAGE.REGISTRATION] },
    { value: TENDER_STAGE.BIDDING, label: TENDER_STAGE_LABEL[TENDER_STAGE.BIDDING] },
    { value: TENDER_STAGE.OPENING, label: TENDER_STAGE_LABEL[TENDER_STAGE.OPENING] },
    { value: TENDER_STAGE.EVALUATION, label: TENDER_STAGE_LABEL[TENDER_STAGE.EVALUATION] },
    { value: TENDER_STAGE.CANDIDATE, label: TENDER_STAGE_LABEL[TENDER_STAGE.CANDIDATE] },
    { value: TENDER_STAGE.AWARDED, label: TENDER_STAGE_LABEL[TENDER_STAGE.AWARDED] },
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-3 space-y-6">
        <div className="bg-gradient-to-r from-blue-700 to-blue-500 rounded-xl text-white p-8">
          <h1 className="text-3xl font-bold">招标投标信息平台</h1>
          <p className="mt-2 text-blue-100">发布招标信息，寻找优质供应商，在线管理投标全流程</p>
          <div className="flex gap-3 mt-4">
            <Link to="/publish" className="bg-white text-blue-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-50 transition">发布招标</Link>
            <Link to="/register" className="border border-white text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition">注册投标方</Link>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex flex-col md:flex-row gap-3">
            <input
              type="text"
              placeholder="搜索招标标题..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <select value={category} onChange={(e) => setCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="">全部分类</option>
              {TENDER_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
            <select value={stage} onChange={(e) => setStage(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="">全部阶段</option>
              {stageOptions.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
        </div>

        <div className="space-y-4">
          {filteredTenders.length === 0 ? (
            <div className="text-center py-12 text-gray-500 bg-white rounded-lg border border-gray-200">暂无符合条件的招标项目</div>
          ) : (
            filteredTenders.map((tender) => <TenderCard key={tender.id} tender={tender} />)
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="font-bold text-gray-900 mb-3 pb-2 border-b">最新公告</h3>
          {announcements.length === 0 ? (
            <p className="text-sm text-gray-500">暂无公告</p>
          ) : (
            <div className="space-y-3">
              {announcements.map((ann) => {
                const tender = tenderService.getById(ann.tenderId)
                return (
                  <div key={ann.id} className="text-sm">
                    <Link to={`/tender/${ann.tenderId}`} className="block">
                      <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded mr-1.5">
                        {ANNOUNCEMENT_TYPE_LABEL[ann.type] || ann.type}
                      </span>
                      <span className="text-gray-800 hover:text-blue-600 line-clamp-2">{ann.title}</span>
                    </Link>
                    <p className="text-xs text-gray-400 mt-0.5">{formatDateShort(ann.createdAt)}</p>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="font-bold text-gray-900 mb-3 pb-2 border-b">快捷入口</h3>
          <div className="space-y-2 text-sm">
            <Link to="/" className="block text-blue-600 hover:text-blue-800 py-1">招标公告</Link>
            <Link to="/" className="block text-blue-600 hover:text-blue-800 py-1">中标结果公告</Link>
            <Link to="/" className="block text-blue-600 hover:text-blue-800 py-1">法律法规</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
