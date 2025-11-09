export default function Modal({ show, onClose, title, icon, children }) {
  if (!show) return null

  return (
    <div className={`modal ${show ? 'active' : ''}`} onClick={onClose}>
      <div className="modal-content glass" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            <i className={`fas fa-${icon}`}></i> {title}
          </h2>
          <button className="btn-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  )
}