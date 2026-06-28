import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export function LoginPage({ login }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    const result = login(username, password)
    if (result.success) {
      navigate('/')
    } else {
      setError(result.message)
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-sm border border-gray-200 p-8">
      <h1 className="text-2xl font-bold text-center text-gray-900 mb-6">用户登录</h1>
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">用户名</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">密码</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-700 text-white py-2.5 rounded-lg hover:bg-blue-800 transition font-medium"
        >
          登录
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-gray-600">
        还没有账号？
        <Link to="/register" className="text-blue-600 hover:underline ml-1">立即注册</Link>
      </p>
      <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-500">
        <p>示例账号：</p>
        <p>招标方：zhaobiao / 123456</p>
        <p>投标方：toubiao / 123456</p>
      </div>
    </div>
  )
}
