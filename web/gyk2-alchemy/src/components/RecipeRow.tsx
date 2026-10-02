import type { Recipe } from '../types'

interface Props {
  recipe: Recipe
  selected: boolean
  onClick: (recipe: Recipe) => void
}

export function RecipeRow({ recipe, selected, onClick }: Props) {
  return (
    <li
      className={`recipe-row${selected ? ' selected' : ''}`}
      onClick={() => onClick(recipe)}
    >
      <span className="recipe-name">{recipe.name}</span>
    </li>
  )
}
