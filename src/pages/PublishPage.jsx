import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { tenderService, announcementService } from '../services/storage'
import { TENDER_CATEGORIES, TENDER_METHODS, TENDER_STAGE, ANNOUNCEMENT_TYPE } from '../utils/constants'
import { generateId } from '../utils/helpers'

export function PublishPage({ user }) {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    title: '', category: TENDER_CATEGORIES[0].value, method: TENDER_METHODS[0].value,
    budget: '', depositAmount: '', description: '',
    deadline: '', registrationDeadline: '',
    contactName: '', contactPhone: '',
  })
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    if (!form.title || !form.budget || !form.deadline || !form.description) {
      setError('请填写完整信息'); return
    }
    if (Number(form.budget) <= 0) {
      setError('预算金额必须大于0'); return
    }

    const tender = {
      id: generateId(),
      ...form,
      budget: Number(form.budget),
      depositAmount: Number(form.depositAmount) || 0,
      ownerId: user.id,
      ownerName: user.companyName || user.username,
      createdAt: new Date().toISOString(),
      stage: TENDER_STAGE.ANNOUNCED,
      registrationDeadline: form.registrationDeadline || form.deadline,
      startTime: new Date().toISOString(),
    }
    tenderService.create(tender)

    announcementService.create({
      id: generateId(),
      tenderId: tender.id,
      type: ANNOUNCEMENT_TYPE.TENDER,
      title: `${tender.title}招标公告`,
      content: `1. 招标条件\n${tender.title}已批准建设，招标人为${tender.ownerName}。项目已具备招标条件，现对该项目进行${form.method === 'invite' ? '邀请' : '公开'}招标。\n\n2. 项目概况\n${tender.description}\n\n预算金额：￥${tender.budget.toLocaleString('zh-CN')}元\n\n3. 投标人资格要求\n3.1 具有独立法人资格\n3.2 本项目${form.method === 'invite' ? '采用' : '不'}接受联合体投标`,
      createdAt: new Date().toISOString(),
    })

    navigate(`/tender/${tender.id}`)
  }

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">发布招标</h1>
      {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">招标标题 *</label>
          <input type="text" name="title" value={form.title} onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">分类</label>
            <select name="category" value={form.category} onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
              {TENDER_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">招标方式</label>
            <select name="method" value={form.method} onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
              {TENDER_METHODS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">预算金额（元） *</label>
            <input type="number" name="budget" value={form.budget} onChange={handleChange} min="1"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">保证金（元）</label>
            <input type="number" name="depositAmount" value={form.depositAmount} onChange={handleChange} min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">报名截止时间 *</label>
            <input type="datetime-local" name="registrationDeadline" value={form.registrationDeadline} onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">开标时间 *</label>
            <input type="datetime-local" name="deadline" value={form.deadline} onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">联系人</label>
            <input type="text" name="contactName" value={form.contactName} onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">联系电话</label>
            <input type="text" name="contactPhone" value={form.contactPhone} onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">项目描述 *</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows={5}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" className="bg-blue-700 text-white px-6 py-2.5 rounded-lg hover:bg-blue-800 transition font-medium">立即发布</button>
          <button type="button" onClick={() => navigate(-1)} className="bg-gray-100 text-gray-800 px-6 py-2.5 rounded-lg hover:bg-gray-200 transition font-medium">取消</button>
        </div>
      </form>
    </div>
  )
}
