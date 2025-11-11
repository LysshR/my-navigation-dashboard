import { memo, useCallback } from 'react'

const Modal = memo(function Modal({ show, onClose, title, icon, children }) {
  const handleBackdropClick = useCallback(() => {
    onClose()
  }, [onClose])

  const handleContentClick = useCallback((e) => {
    e.stopPropagation()
  }, [])

  if (!show) return null

  return (
    <div className={`modal ${show ? 'active' : ''}`} onClick={handleBackdropClick}>
      <div className="modal-content glass" onClick={handleContentClick}>
        <div className="modal-header">
          <h2>
            <i className={`fas fa-${icon}`}></i> {title}
          </h2>
          <button className="btn-close" onClick={onClose} type="button">
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  )
})

export default Modal