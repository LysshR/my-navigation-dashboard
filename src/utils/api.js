// API 调用工具 - 处理与服务器的通信和密码验证

// 从 sessionStorage 获取编辑模式状态
export function getEditMode() {
  if (typeof window === 'undefined') return false
  return sessionStorage.getItem('dashboardEditMode') === 'true'
}

// 设置编辑模式状态
export function setEditMode(enabled) {
  if (typeof window === 'undefined') return
  sessionStorage.setItem('dashboardEditMode', enabled ? 'true' : 'false')
}

// 清除编辑模式状态
export function clearEditMode() {
  if (typeof window === 'undefined') return
  sessionStorage.removeItem('dashboardEditMode')
}

// 从 sessionStorage 获取密码（用于编辑操作）
export function getPassword() {
  if (typeof window === 'undefined') return null
  return sessionStorage.getItem('dashboardPassword')
}

// 设置密码到 sessionStorage
export function setPassword(password) {
  if (typeof window === 'undefined') return
  sessionStorage.setItem('dashboardPassword', password)
}

// 清除密码
export function clearPassword() {
  if (typeof window === 'undefined') return
  sessionStorage.removeItem('dashboardPassword')
  clearEditMode()
}

// 获取数据（无需密码）
export async function fetchData() {
  try {
    const response = await fetch('/api/data')
    
    if (!response.ok) {
      throw new Error('获取数据失败')
    }
    
    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// 验证密码
export async function verifyPassword(password) {
  try {
    const response = await fetch('/api/data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ data: {}, password, verifyOnly: true })
    })
    
    if (response.status === 401) {
      return { success: false, error: '密码错误' }
    }
    
    if (!response.ok) {
      return { success: false, error: '验证失败' }
    }
    
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// 获取 Unsplash 随机背景
export async function fetchUnsplashBackground(query = 'landscape,nature') {
  try {
    const response = await fetch(`/api/unsplash?query=${encodeURIComponent(query)}`)
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || '获取背景失败')
    }
    
    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// 保存数据
export async function saveDataToServer(data, password) {
  try {
    const response = await fetch('/api/data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ data, password })
    })
    
    if (response.status === 401) {
      throw new Error('密码错误')
    }
    
    if (!response.ok) {
      throw new Error('保存数据失败')
    }
    
    const result = await response.json()
    return { success: true, result }
  } catch (error) {
    return { success: false, error: error.message }
  }
}
