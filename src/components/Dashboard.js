'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import CategorySection from './CategorySection'
import Modal from './Modal'
import PasswordModal from './PasswordModal'
import { compressData, decompressData } from '@/utils/storage'
import { getPassword, setPassword, clearPassword, getEditMode, setEditMode, clearEditMode, fetchData, saveDataToServer, verifyPassword, fetchUnsplashBackground, setUnsplashApiKey } from '@/utils/api'

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
  const [isEditMode, setIsEditModeState] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [pendingAction, setPendingAction] = useState(null)
  const [showSettings, setShowSettings] = useState(false)
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [showAddCard, setShowAddCard] = useState(false)
  const [currentCategoryId, setCurrentCategoryId] = useState(null)
  const [backgroundInput, setBackgroundInput] = useState('')
  const [categoryNameInput, setCategoryNameInput] = useState('')
  const [cardData, setCardData] = useState({ title: '', url: '', icon: '' })
  const [isSaving, setIsSaving] = useState(false)
  const [isLoadingUnsplash, setIsLoadingUnsplash] = useState(false)
  const [apiKeyInput, setApiKeyInput] = useState('')
  const [isSavingApiKey, setIsSavingApiKey] = useState(false)
  const notificationTimeoutRef = useRef(null)

  // 初始化 - 直接加载数据，检查编辑模式
  useEffect(() => {
    const editMode = getEditMode()
    const password = getPassword()
    
    if (editMode && password) {
      setIsEditModeState(true)
    }
    
    loadData()
  }, [])

  // 加载数据（无需密码）
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true)
      const result = await fetchData()
      
      if (result.success) {
        const decompressed = decompressData(result.data)
        setData(decompressed)
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
      const result = await verifyPassword(password)
      
      if (result.success) {
        setPassword(password)
        setEditMode(true)
        setIsEditModeState(true)
        setShowPasswordModal(false)
        showNotification('已进入编辑模式')
        
        // 执行待处理的操作
        if (pendingAction) {
          pendingAction()
          setPendingAction(null)
        }
        
        return { success: true }
      } else {
        return { success: false, error: result.error }
      }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }, [pendingAction])
  
  // 检查并请求编辑权限
  const requireEditMode = useCallback((action) => {
    if (isEditMode) {
      action()
    } else {
      setPendingAction(() => action)
      setShowPasswordModal(true)
    }
  }, [isEditMode])
  
  // 退出编辑模式
  const exitEditMode = useCallback(() => {
    if (confirm('确定要退出编辑模式吗？')) {
      clearPassword()
      setIsEditModeState(false)
      showNotification('已退出编辑模式')
    }
  }, [])

  // 保存数据到服务器
  const saveData = useCallback(async (newData) => {
    const password = getPassword()
    if (!password || !isEditMode) {
      showNotification('请先进入编辑模式')
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
          setIsEditModeState(false)
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
  }, [isEditMode])

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

  // 获取 Unsplash 背景
  const getUnsplashBackground = useCallback(async () => {
    setIsLoadingUnsplash(true)
    try {
      const result = await fetchUnsplashBackground()
      if (result.success) {
        setBackgroundInput(result.data.regular)
        showNotification('背景图片已更新')
      } else {
        showNotification('获取背景失败: ' + result.error)
      }
    } catch (error) {
      showNotification('获取背景失败')
    } finally {
      setIsLoadingUnsplash(false)
    }
  }, [])

  // 设置 Unsplash API key
  const setApiKey = useCallback(async () => {
    if (!apiKeyInput.trim()) {
      showNotification('API key 不能为空')
      return
    }

    setIsSavingApiKey(true)
    try {
      const result = await setUnsplashApiKey(apiKeyInput.trim())
      if (result.success) {
        showNotification('API key 已更新')
        setApiKeyInput('')
      } else {
        showNotification('设置失败: ' + result.error)
      }
    } catch (error) {
      showNotification('设置失败')
    } finally {
      setIsSavingApiKey(false)
    }
  }, [apiKeyInput])

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

  // 包装编辑操作
  const wrappedUpdateBackground = useCallback(() => {
    requireEditMode(updateBackground)
  }, [requireEditMode, updateBackground])
  
  const wrappedAddCategory = useCallback(() => {
    requireEditMode(addCategory)
  }, [requireEditMode, addCategory])
  
  const wrappedAddCard = useCallback(() => {
    requireEditMode(addCard)
  }, [requireEditMode, addCard])
  
  const wrappedDeleteCategory = useCallback((categoryId) => {
    requireEditMode(() => deleteCategory(categoryId))
  }, [requireEditMode, deleteCategory])
  
  const wrappedDeleteCard = useCallback((categoryId, cardId) => {
    requireEditMode(() => deleteCard(categoryId, cardId))
  }, [requireEditMode, deleteCard])

  const wrappedSetApiKey = useCallback(() => {
    requireEditMode(setApiKey)
  }, [requireEditMode, setApiKey])

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
            {isEditMode && (
              <span className="edit-mode-badge">
                <i className="fas fa-edit"></i> 编辑模式
              </span>
            )}
            <button 
              className="btn-icon" 
              onClick={() => {
                requireEditMode(() => {
                  setShowSettings(true)
                  setBackgroundInput(data.background)
                })
              }}
              title="设置背景"
              type="button"
            >
              <i className="fas fa-image"></i>
            </button>
            {isEditMode ? (
              <button 
                className="btn-icon btn-edit-mode" 
                onClick={exitEditMode}
                title="退出编辑模式"
                type="button"
              >
                <i className="fas fa-lock"></i>
              </button>
            ) : (
              <button 
                className="btn-icon" 
                onClick={() => setShowPasswordModal(true)}
                title="进入编辑模式"
                type="button"
              >
                <i className="fas fa-unlock"></i>
              </button>
            )}
          </div>
        </header>

        <main className="main-content">
          {data.categories.map(category => (
            <CategorySection
              key={category.id}
              category={category}
              onDeleteCategory={wrappedDeleteCategory}
              onAddCard={(categoryId) => requireEditMode(() => openAddCard(categoryId))}
              onDeleteCard={wrappedDeleteCard}
              isEditMode={isEditMode}
            />
          ))}
        </main>

        {isEditMode && (
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
        )}
      </div>

      {/* 设置模态框 */}
      <Modal
        show={showSettings}
        onClose={() => setShowSettings(false)}
        title="设置背景"
        icon="image"
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
            onKeyPress={(e) => e.key === 'Enter' && !isSaving && wrappedUpdateBackground()}
            disabled={isSaving || isLoadingUnsplash}
          />
        </div>
        <button 
          className="btn-secondary" 
          onClick={getUnsplashBackground}
          disabled={isSaving || isLoadingUnsplash}
          type="button"
          style={{ marginBottom: '10px' }}
        >
          <i className="fas fa-random"></i> {isLoadingUnsplash ? '获取中...' : '随机 Unsplash 图片'}
        </button>
        <button 
          className="btn-primary" 
          onClick={wrappedUpdateBackground}
          disabled={isSaving || isLoadingUnsplash}
          type="button"
          style={{ marginBottom: '15px' }}
        >
          <i className="fas fa-save"></i> {isSaving ? '保存中...' : '保存背景'}
        </button>
        
        <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)', margin: '20px 0' }} />
        
        <div className="form-group">
          <label htmlFor="apikey-input">Unsplash API Key</label>
          <input
            id="apikey-input"
            type="password"
            className="input-field"
            placeholder="输入你的 Unsplash API Key（覆盖设置）"
            value={apiKeyInput}
            onChange={(e) => setApiKeyInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !isSavingApiKey && wrappedSetApiKey()}
            disabled={isSaving || isSavingApiKey}
          />
          <small style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', display: 'block', marginTop: '5px' }}>
            仅用于获取随机图片，不会显示在界面上
          </small>
        </div>
        <button 
          className="btn-secondary" 
          onClick={wrappedSetApiKey}
          disabled={isSaving || isSavingApiKey}
          type="button"
        >
          <i className="fas fa-key"></i> {isSavingApiKey ? '设置中...' : '设置 API Key'}
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
          onClick={wrappedAddCategory}
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
          onClick={wrappedAddCard}
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
        onClose={() => {
          setShowPasswordModal(false)
          setPendingAction(null)
        }}
        loading={false}
      />
    </>
  )
}
