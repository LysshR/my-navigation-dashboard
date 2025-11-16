'use client'

import { useState } from 'react'
import Modal from './Modal'

export default function PasswordModal({ show, onSubmit, onClose, loading = false }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!password.trim()) {
      setError('请输入密码')
      return
    }
    
    setError('')
    const result = await onSubmit(password)
    
    if (!result.success) {
      setError(result.error || '密码验证失败')
      setPassword('')
    } else {
      setPassword('')
    }
  }

  const handleClose = () => {
    setPassword('')
    setError('')
    onClose()
  }

  return (
    <Modal
      show={show}
      onClose={handleClose}
      title="输入密码"
      icon="lock"
    >
      <div className="form-group">
        <label htmlFor="password-input">访问密码</label>
        <input
          id="password-input"
          type="password"
          className="input-field"
          placeholder="输入密码"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && !loading && handleSubmit()}
          autoFocus
          disabled={loading}
        />
      </div>
      {error && <div className="error-message" style={{ color: '#ff6b6b', marginBottom: '1rem' }}>{error}</div>}
      <button 
        className="btn-primary" 
        onClick={handleSubmit}
        disabled={loading}
        type="button"
      >
        {loading ? '验证中...' : '确认'}
      </button>
    </Modal>
  )
}
