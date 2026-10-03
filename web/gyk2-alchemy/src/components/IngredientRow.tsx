import type { Ingredient } from '../types'

interface Props {
  ingredient: Ingredient
  selected: boolean
  onClick: (ingredient: Ingredient) => void
}

export function IngredientRow({ ingredient, selected, onClick }: Props) {
  return (
    <li
      className={`ingredient-row${selected ? ' selected' : ''}`}
      onClick={() => onClick(ingredient)}
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
