// API 调用工具 - 处理与服务器的通信和密码验证

// 从 sessionStorage 获取密码（用户当前会话的密码）
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
}

// 获取数据
export async function fetchData(password) {
  try {
    const response = await fetch(`/api/data?password=${encodeURIComponent(password)}`)
    
    if (response.status === 401) {
      throw new Error('密码错误')
    }
    
    if (!response.ok) {
      throw new Error('获取数据失败')
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
