import type { Ingredient } from '../types'

interface Props {
  ingredient: Ingredient
  selected: boolean
  preferred: boolean
  solutionCount: number | null
  onClick: (ingredient: Ingredient) => void
  onRightClick: (ingredient: Ingredient) => void
}

export function IngredientRow({ ingredient, selected, preferred, solutionCount, onClick, onRightClick }: Props) {
  function handleContextMenu(e: React.MouseEvent) {
    e.preventDefault()
    onRightClick(ingredient)
  }

  const zero = solutionCount === 0
  const cls = ['ingredient-row', selected ? 'selected' : '', preferred ? 'preferred' : '', zero ? 'zero-solutions' : ''].filter(Boolean).join(' ')

  return (
    <li
      className={cls}
      onClick={() => onClick(ingredient)}
      onContextMenu={handleContextMenu}
    >
      <span className="ingredient-name">{ingredient.name}</span>
      {solutionCount !== null && (
        <span className="solution-count-badge">{solutionCount}</span>
      )}
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
