import Card from './Card'

export default function CategorySection({ category, onDeleteCategory, onAddCard, onDeleteCard }) {
  return (
    <div className="category">
      <div className="category-header">
        <h2 className="category-title">
          <i className="fas fa-folder"></i>
          {category.name}
        </h2>
        <div className="category-actions">
          <button 
            className="btn-small btn-delete"
            onClick={() => onDeleteCategory(category.id)}
          >
            <i className="fas fa-trash"></i> 删除分类
          </button>
        </div>
      </div>
      
      <div className="cards-grid">
        {category.cards.map(card => (
          <Card
            key={card.id}
            card={card}
            onDelete={() => onDeleteCard(category.id, card.id)}
          />
        ))}
        
        <div 
          className="card card-add glass"
          onClick={() => onAddCard(category.id)}
        >
          <i className="fas fa-plus"></i>
          <span>添加网站</span>
        </div>
      </div>
    </div>
  )
}