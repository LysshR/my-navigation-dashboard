'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import CategorySection from './CategorySection'
import Modal from './Modal'
import PasswordModal from './PasswordModal'
import { compressData, decompressData } from '@/utils/storage'
import { getPassword, setPassword, clearPassword, fetchData, saveDataToServer } from '@/utils/api'

const initialData = {
  background: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1920',
  categories: [
    {
      id: '1',
      name: '常用工具',
      cards: [
        {
          id: '1',
          title: 'Google',
          url: 'https://www.google.com',
          icon: 'https://www.google.com/favicon.ico'
        },
        {
          id: '2',
          title: 'GitHub',
          url: 'https://github.com',
          icon: 'https://github.com/favicon.ico'
        }
      ]
    },
    {
      id: '2',
      name: '社交媒体',
      cards: [
        {
          id: '3',
          title: 'Twitter',
          url: 'https://twitter.com',
          icon: 'https://twitter.com/favicon.ico'
        }
      ]
    }
  ]
}

export default function Dashboard() {
  const [data, setData] = useState(initialData)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [showAddCard, setShowAddCard] = useState(false)
  const [currentCategoryId, setCurrentCategoryId] = useState(null)
  const [backgroundInput, setBackgroundInput] = useState('')
  const [categoryNameInput, setCategoryNameInput] = useState('')
  const [cardData, setCardData] = useState({ title: '', url: '', icon: '' })
  const [isSaving, setIsSaving] = useState(false)
  const notificationTimeoutRef = useRef(null)

  // 初始化 - 检查是否已有密码
  useEffect(() => {
    const storedPassword = getPassword()
    if (storedPassword) {
      setIsAuthenticated(true)
      loadData(storedPassword)
    } else {
      setShowPasswordModal(true)
      setIsLoading(false)
    }
  }, [])

  // 加载数据
  const loadData = useCallback(async (password) => {
    try {
      setIsLoading(true)
      const result = await fetchData(password)
      
      if (result.success) {
        const decompressed = decompressData(result.data)
        setData(decompressed)
        setIsAuthenticated(true)
        setPassword(password)
        showNotification('数据加载成功')
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Failed to load data:', error)
      showNotification('数据加载失败: ' + error.message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 处理密码验证
  const handlePasswordSubmit = useCallback(async (password) => {
    try {
      const result = await fetchData(password)
      
      if (result.success) {
        const decompressed = decompressData(result.data)
        setData(decompressed)
        setIsAuthenticated(true)
        setPassword(password)
        setShowPasswordModal(false)
        showNotification('认证成功')
        return { success: true }
      } else {
        return { success: false, error: result.error }
      }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }, [])

  // 保存数据到服务器
  const saveData = useCallback(async (newData) => {
    const password = getPassword()
    if (!password) {
      showNotification('请先输入密码')
      return
    }

    setIsSaving(true)
    try {
      const compressed = compressData(newData)
      const result = await saveDataToServer(compressed, password)
      
      if (result.success) {
        setData(newData)
        showNotification('数据已保存')
      } else {
        if (result.error === '密码错误') {
          clearPassword()
          setIsAuthenticated(false)
          setShowPasswordModal(true)
        }
        showNotification('保存失败: ' + result.error)
      }
    } catch (error) {
      console.error('Failed to save data:', error)
      showNotification('保存失败')
    } finally {
      setIsSaving(false)
    }
  }, [])

  // 显示通知
  const showNotification = useCallback((message) => {
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current)
    }
    
    const notification = document.createElement('div')
    notification.className = 'notification'
    notification.textContent = message
    document.body.appendChild(notification)
    
    notificationTimeoutRef.current = setTimeout(() => {
      notification.remove()
      notificationTimeoutRef.current = null
    }, 2000)
  }, [])

  // 更新背景
  const updateBackground = useCallback(() => {
    if (backgroundInput.trim()) {
      const newData = { ...data, background: backgroundInput.trim() }
      saveData(newData)
      setShowSettings(false)
    }
  }, [backgroundInput, data, saveData])

  // 添加分类
  const addCategory = useCallback(() => {
    if (categoryNameInput.trim()) {
      const newCategory = {
        id: Date.now().toString(),
        name: categoryNameInput.trim(),
        cards: []
      }
      const newData = {
        ...data,
        categories: [...data.categories, newCategory]
      }
      saveData(newData)
      setShowAddCategory(false)
      setCategoryNameInput('')
    }
  }, [categoryNameInput, data, saveData])

  // 删除分类
  const deleteCategory = useCallback((categoryId) => {
    if (confirm('确定要删除这个分类吗？')) {
      const newData = {
        ...data,
        categories: data.categories.filter(cat => cat.id !== categoryId)
      }
      saveData(newData)
    }
  }, [data, saveData])

  // 打开添加卡片模态框
  const openAddCard = useCallback((categoryId) => {
    setCurrentCategoryId(categoryId)
    setShowAddCard(true)
    setCardData({ title: '', url: '', icon: '' })
  }, [])

  // 添加卡片
  const addCard = useCallback(() => {
    if (cardData.title.trim() && cardData.url.trim()) {
      const newCard = {
        id: Date.now().toString(),
        title: cardData.title.trim(),
        url: cardData.url.trim(),
        icon: cardData.icon.trim() || `${cardData.url.trim()}/favicon.ico`
      }
      
      const newData = {
        ...data,
        categories: data.categories.map(cat => 
          cat.id === currentCategoryId 
            ? { ...cat, cards: [...cat.cards, newCard] }
            : cat
        )
      }
      
      saveData(newData)
      setShowAddCard(false)
    }
  }, [cardData, currentCategoryId, data, saveData])

  // 删除卡片
  const deleteCard = useCallback((categoryId, cardId) => {
    const newData = {
      ...data,
      categories: data.categories.map(cat => 
        cat.id === categoryId 
          ? { ...cat, cards: cat.cards.filter(card => card.id !== cardId) }
          : cat
      )
    }
    saveData(newData)
  }, [data, saveData])

  // 登出
  const handleLogout = useCallback(() => {
    if (confirm('确定要退出登录吗？')) {
      clearPassword()
      setIsAuthenticated(false)
      setShowPasswordModal(true)
      showNotification('已退出登录')
    }
  }, [])

  if (isLoading) {
    return (
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem', marginBottom: '1rem' }}></i>
          <p>加载中...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <>
        <div 
          className="background-layer" 
          style={{ backgroundImage: `url(${initialData.background})` }}
        />
        <PasswordModal
          show={showPasswordModal}
          onSubmit={handlePasswordSubmit}
          onClose={() => {}}
          loading={false}
        />
      </>
    )
  }

  return (
    <>
      <div 
        className="background-layer" 
        style={{ backgroundImage: `url(${data.background})` }}
      />
      
      <div className="container">
        <header className="header glass">
          <h1 className="title">
            <i className="fas fa-compass"></i>
            Dashboard
          </h1>
          <div className="header-actions">
            <button 
              className="btn-icon" 
              onClick={() => {
                setShowSettings(true)
                setBackgroundInput(data.background)
              }}
              title="设置"
              type="button"
            >
              <i className="fas fa-cog"></i>
            </button>
            <button 
              className="btn-icon" 
              onClick={handleLogout}
              title="退出登录"
              type="button"
            >
              <i className="fas fa-sign-out-alt"></i>
            </button>
          </div>
        </header>

        <main className="main-content">
          {data.categories.map(category => (
            <CategorySection
              key={category.id}
              category={category}
              onDeleteCategory={deleteCategory}
              onAddCard={openAddCard}
              onDeleteCard={deleteCard}
            />
          ))}
        </main>

        <button 
          className="btn-add-category glass"
          onClick={() => {
            setShowAddCategory(true)
            setCategoryNameInput('')
          }}
          type="button"
          disabled={isSaving}
        >
          <i className="fas fa-plus"></i>
          添加分类
        </button>
      </div>

      {/* 设置模态框 */}
      <Modal
        show={showSettings}
        onClose={() => setShowSettings(false)}
        title="设置"
        icon="cog"
      >
        <div className="form-group">
          <label htmlFor="bg-input">背景图片 URL</label>
          <input
            id="bg-input"
            type="text"
            className="input-field"
            placeholder="输入图片URL"
            value={backgroundInput}
            onChange={(e) => setBackgroundInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !isSaving && updateBackground()}
            disabled={isSaving}
          />
        </div>
        <button 
          className="btn-primary" 
          onClick={updateBackground}
          disabled={isSaving}
          type="button"
        >
          <i className="fas fa-save"></i> {isSaving ? '保存中...' : '保存背景'}
        </button>
      </Modal>

      {/* 添加分类模态框 */}
      <Modal
        show={showAddCategory}
        onClose={() => setShowAddCategory(false)}
        title="添加分类"
        icon="folder-plus"
      >
        <div className="form-group">
          <label htmlFor="category-input">分类名称</label>
          <input
            id="category-input"
            type="text"
            className="input-field"
            placeholder="例如：常用工具"
            value={categoryNameInput}
            onChange={(e) => setCategoryNameInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !isSaving && addCategory()}
            autoFocus
            disabled={isSaving}
          />
        </div>
        <button 
          className="btn-primary" 
          onClick={addCategory}
          disabled={isSaving}
          type="button"
        >
          <i className="fas fa-check"></i> {isSaving ? '添加中...' : '添加'}
        </button>
      </Modal>

      {/* 添加卡片模态框 */}
      <Modal
        show={showAddCard}
        onClose={() => setShowAddCard(false)}
        title="添加网站"
        icon="bookmark"
      >
        <div className="form-group">
          <label htmlFor="card-title">网站名称</label>
          <input
            id="card-title"
            type="text"
            className="input-field"
            placeholder="例如：Google"
            value={cardData.title}
            onChange={(e) => setCardData({ ...cardData, title: e.target.value })}
            autoFocus
            disabled={isSaving}
          />
        </div>
        <div className="form-group">
          <label htmlFor="card-url">网站地址</label>
          <input
            id="card-url"
            type="url"
            className="input-field"
            placeholder="https://example.com"
            value={cardData.url}
            onChange={(e) => setCardData({ ...cardData, url: e.target.value })}
            disabled={isSaving}
          />
        </div>
        <div className="form-group">
          <label htmlFor="card-icon">图标地址</label>
          <input
            id="card-icon"
            type="url"
            className="input-field"
            placeholder="https://example.com/favicon.ico"
            value={cardData.icon}
            onChange={(e) => setCardData({ ...cardData, icon: e.target.value })}
            onKeyPress={(e) => e.key === 'Enter' && !isSaving && addCard()}
            disabled={isSaving}
          />
        </div>
        <button 
          className="btn-primary" 
          onClick={addCard}
          disabled={isSaving}
          type="button"
        >
          <i className="fas fa-check"></i> {isSaving ? '添加中...' : '添加'}
        </button>
      </Modal>

      {/* 密码验证模态框 */}
      <PasswordModal
        show={showPasswordModal}
        onSubmit={handlePasswordSubmit}
        onClose={() => {}}
        loading={false}
      />
    </>
  )
}
