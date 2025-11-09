export default function Card({ card, onDelete }) {
  return (
    <a 
      href={card.url} 
      target="_blank" 
      rel="noopener noreferrer"
      className="card glass"
    >
      <button 
        className="card-delete"
        onClick={(e) => {
          e.preventDefault()
          onDelete()
        }}
      >
        <i className="fas fa-times"></i>
      </button>
      
      <div className="card-content">
        <img 
          src={card.icon} 
          alt={card.title}
          className="card-icon"
          onError={(e) => {
            e.target.src = `https://via.placeholder.com/64?text=${card.title.charAt(0)}`
          }}
        />
        <div className="card-title">{card.title}</div>
      </div>
    </a>
  )
}