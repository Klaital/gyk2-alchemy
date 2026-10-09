import type { Ingredient } from '../types'

interface Props {
  ingredient: Ingredient
  selected: boolean
  preferred: boolean
  onClick: (ingredient: Ingredient) => void
  onRightClick: (ingredient: Ingredient) => void
}

export function IngredientRow({ ingredient, selected, preferred, onClick, onRightClick }: Props) {
  function handleContextMenu(e: React.MouseEvent) {
    e.preventDefault()
    onRightClick(ingredient)
  }

  const cls = ['ingredient-row', selected ? 'selected' : '', preferred ? 'preferred' : ''].filter(Boolean).join(' ')

  return (
    <li
      className={cls}
      onClick={() => onClick(ingredient)}
      onContextMenu={handleContextMenu}
    >
      <span className="ingredient-name">{ingredient.name}</span>
      {ingredient.locations.length > 0 && (
        <span className="location-tags">
          {ingredient.locations.map(loc => (
            <span key={loc} className="tag">{loc}</span>
          ))}
        </span>
      )}
    </li>
  )
}
