import type { Ingredient } from '../types'

interface Props {
  ingredient: Ingredient
}

export function IngredientRow({ ingredient }: Props) {
  return (
    <li className="ingredient-row">
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
