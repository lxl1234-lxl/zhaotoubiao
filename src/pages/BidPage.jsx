import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { tenderService, bidService } from '../services/storage'
import { BID_STATUS, TENDER_STAGE } from '../utils/constants'
import { generateId, formatMoney } from '../utils/helpers'

export function BidPage({ user }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const tender = tenderService.getById(id)

  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    price: '',
    companyName: user?.companyName || '',
    contactName: '',
    contactPhone: '',
    techProposal: '',
    commercialDoc: '',
    depositConfirmed: false,
  })
  const [error, setError] = useState('')

  if (!tender) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
        <p className="text-gray-500">招标项目不存在</p>
        <Link to="/" className="text-blue-600 hover:underline mt-2 inline-block">返回首页</Link>
      </div>
    )
  }

  const existingBid = bidService.getByBidderId(user.id).find((b) => b.tenderId === tender.id)
  if (existingBid) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
        <p className="text-gray-500">您已经对该招标提交过投标了</p>
        <Link to="/bidder-dashboard" className="text-blue-600 hover:underline mt-2 inline-block">查看我的投标</Link>
      </div>
    )
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmitRegistration = () => {
    if (!form.companyName) {
      setError('请输入公司名称')
      return
    }
    setError('')
    setStep(2)
  }

  const handleSubmitBid = (e) => {
    e.preventDefault()
    setError('')
    if (!form.price || Number(form.price) <= 0) {
      setError('请输入有效的投标报价')
      return
    }
    const bid = {
      id: generateId(),
      tenderId: tender.id,
      bidderId: user.id,
      bidderName: form.companyName || user.companyName || user.username,
      price: Number(form.price),
      techProposal: form.techProposal,
      commercialDoc: form.commercialDoc,
      contactName: form.contactName,
      contactPhone: form.contactPhone,
      depositPaid: form.depositConfirmed,
      status: BID_STATUS.SUBMITTED,
      createdAt: new Date().toISOString(),
    }
    bidService.create(bid)
    navigate('/bidder-dashboard')
  }

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">提交投标</h1>
      <p className="text-gray-500 mb-6">招标项目：{tender.title}</p>

      <div className="flex items-center mb-8">
        {[1, 2].map((s) => (
          <div key={s} className="flex items-center flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${s <= step ? 'bg-blue-700 text-white' : 'bg-gray-200 text-gray-500'}`}>
              {s < step ? '✓' : s}
            </div>
            <span className={`ml-2 text-sm font-medium ${s <= step ? 'text-blue-700' : 'text-gray-400'}`}>
              {s === 1 ? '投标报名' : '递交投标文件'}
            </span>
            {s < 2 && <div className={`flex-1 h-0.5 mx-4 ${s < step ? 'bg-blue-700' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}

      {step === 1 && (
        <div className="space-y-4">
          <h2 className="font-semibold text-gray-900">第一步：投标报名</h2>
          <p className="text-sm text-gray-500">请填写企业信息和选择投标方式</p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">公司名称</label>
            <input type="text" name="companyName" value={form.companyName} onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">联系人</label>
              <input type="text" name="contactName" value={form.contactName} onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">联系电话</label>
              <input type="text" name="contactPhone" value={form.contactPhone} onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
            </div>
          </div>
          {tender.depositAmount && (
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-100">
              <p className="text-sm text-yellow-800 font-medium">投标保证金：{formatMoney(tender.depositAmount)}</p>
              <label className="flex items-center gap-2 mt-2 text-sm text-gray-700 cursor-pointer">
                <input type="checkbox" name="depositConfirmed" checked={form.depositConfirmed} onChange={handleChange}
                  className="rounded border-gray-300 text-blue-700 focus:ring-blue-500" />
                我已了解并同意在确定中标后缴纳投标保证金
              </label>
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button onClick={handleSubmitRegistration}
              className="bg-blue-700 text-white px-6 py-2.5 rounded-lg hover:bg-blue-800 transition font-medium">
              确认报名，进入下一步
            </button>
            <Link to={`/tender/${tender.id}`} className="bg-gray-100 text-gray-800 px-6 py-2.5 rounded-lg hover:bg-gray-200 transition font-medium">取消</Link>
          </div>
        </div>
      )}

      {step === 2 && (
        <form onSubmit={handleSubmitBid} className="space-y-5">
          <h2 className="font-semibold text-gray-900">第二步：递交投标文件</h2>
          <p className="text-sm text-gray-500">请填写商务报价和技术方案</p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">投标报价（元）</label>
            <input type="number" name="price" value={form.price} onChange={handleChange} min="1"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">商务条款 / 付款方式</label>
            <textarea name="commercialDoc" value={form.commercialDoc} onChange={handleChange} rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="付款方式、质保期限、违约责任等商务条款" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">技术方案 / 资质说明</label>
            <textarea name="techProposal" value={form.techProposal} onChange={handleChange} rows={5}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="技术方案、实施计划、业绩证明等" required />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" className="bg-blue-700 text-white px-6 py-2.5 rounded-lg hover:bg-blue-800 transition font-medium">提交投标</button>
            <button type="button" onClick={() => setStep(1)} className="bg-gray-100 text-gray-800 px-6 py-2.5 rounded-lg hover:bg-gray-200 transition font-medium">返回上一步</button>
          </div>
        </form>
      )}
    </div>
  )
}
