import { Link, useNavigate, useLocation } from 'react-router-dom'
import { ROLES, ROLES_LABEL } from '../utils/constants'

export function Layout({ user, logout, children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const pathParts = location.pathname.split('/').filter(Boolean)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/')

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-blue-700 text-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="text-xl font-bold tracking-tight flex items-center gap-2">
              招标投标网
            </Link>
            <nav className="hidden md:flex items-center gap-1">
              <NavLink to="/" active={isActive('/')}>首页</NavLink>
              {user?.role === ROLES.OWNER && (
                <>
                  <NavLink to="/publish" active={isActive('/publish')}>发布招标</NavLink>
                  <NavLink to="/owner-dashboard" active={isActive('/owner-dashboard')}>招标管理</NavLink>
                </>
              )}
              {user?.role === ROLES.BIDDER && (
                <NavLink to="/bidder-dashboard" active={isActive('/bidder-dashboard')}>我的投标</NavLink>
              )}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <span className="text-sm opacity-90">
                  {user.companyName || user.username}
                  <span className="ml-1.5 text-xs bg-blue-600 px-2 py-0.5 rounded-full">
                    {ROLES_LABEL[user.role]}
                  </span>
                </span>
                <button
                  onClick={handleLogout}
                  className="text-sm bg-white text-blue-700 px-3 py-1.5 rounded hover:bg-blue-50 transition"
                >
                  退出
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm bg-white text-blue-700 px-4 py-2 rounded hover:bg-blue-50 transition">登录</Link>
                <Link to="/register" className="text-sm border border-white text-white px-4 py-2 rounded hover:bg-blue-600 transition">注册</Link>
              </>
            )}
          </div>
        </div>
        {pathParts.length > 1 && (
          <div className="max-w-7xl mx-auto px-4 pb-3 text-xs text-blue-200">
            <Breadcrumb parts={pathParts} />
          </div>
        )}
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        {children}
      </main>

      <footer className="bg-gray-800 text-gray-300 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm">
          <p>招标投标网站 · 个人学习项目 · 模拟全流程招标投标平台</p>
          <p className="mt-1 text-gray-500">数据仅保存在当前浏览器中</p>
        </div>
      </footer>
    </div>
  )
}

function NavLink({ to, active, children }) {
  return (
    <Link to={to} className={`px-3 py-2 rounded text-sm font-medium transition ${active ? 'bg-blue-800 text-white' : 'hover:bg-blue-600'}`}>
      {children}
    </Link>
  )
}

function Breadcrumb({ parts }) {
  return (
    <nav className="flex items-center gap-1">
      <Link to="/" className="hover:text-white transition">首页</Link>
      {parts.map((part, idx) => (
        <span key={idx} className="flex items-center gap-1">
          <span className="text-blue-400">/</span>
          <span className={idx === parts.length - 1 ? 'text-white' : ''}>{part}</span>
        </span>
      ))}
    </nav>
  )
}
