import { memo } from 'react'
import Card from './Card'

const CategorySection = memo(function CategorySection({ category, onDeleteCategory, onAddCard, onDeleteCard }) {
  const handleDeleteCategory = () => {
    onDeleteCategory(category.id)
  }

  const handleAddCard = () => {
    onAddCard(category.id)
  }

  const handleDeleteCard = (cardId) => {
    onDeleteCard(category.id, cardId)
  }

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
            onClick={handleDeleteCategory}
            type="button"
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
            onDelete={() => handleDeleteCard(card.id)}
          />
        ))}
        
        <div 
          className="card card-add glass"
          onClick={handleAddCard}
          role="button"
          tabIndex={0}
          onKeyPress={(e) => e.key === 'Enter' && handleAddCard()}
        >
          <i className="fas fa-plus"></i>
          <span>添加网站</span>
        </div>
      </div>
    </div>
  )
})

export default CategorySection