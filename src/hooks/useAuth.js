import { useState, useEffect, useCallback } from 'react'
import { authService, userService } from '../services/storage'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const current = authService.getCurrentUser()
    setUser(current)
    setLoading(false)
  }, [])

  const login = useCallback((username, password) => {
    const found = userService.findByUsername(username)
    if (!found) return { success: false, message: '用户名不存在' }
    if (found.password !== password) return { success: false, message: '密码错误' }
    authService.setCurrentUser(found)
    setUser(found)
    return { success: true }
  }, [])

  const register = useCallback((username, password, role, companyName = '') => {
    if (!username || !password) return { success: false, message: '用户名和密码不能为空' }
    if (userService.findByUsername(username)) {
      return { success: false, message: '用户名已存在' }
    }
    const newUser = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2, 9),
      username,
      password,
      role,
      companyName,
      createdAt: new Date().toISOString(),
    }
    userService.create(newUser)
    authService.setCurrentUser(newUser)
    setUser(newUser)
    return { success: true }
  }, [])

  const logout = useCallback(() => {
    authService.logout()
    setUser(null)
  }, [])

  return { user, loading, login, register, logout }
}
