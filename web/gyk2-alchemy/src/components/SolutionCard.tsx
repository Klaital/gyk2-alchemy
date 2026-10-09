import type { Solution } from '../types'

interface Props {
  solution: Solution
  preferredIngredient: string | null
}

export function SolutionCard({ solution, preferredIngredient }: Props) {
  const highlighted = preferredIngredient !== null &&
    solution.Ingredients.some(ing => ing.name === preferredIngredient)

  return (
    <div className={`solution-card${highlighted ? ' highlighted' : ''}`}>
      {solution.Ingredients.map((ing, i) => (
        <span key={i} className="solution-ingredient">
          <span className={ing.name === preferredIngredient ? 'preferred-ingredient' : ''}>{ing.name}</span>
        </span>
      ))}
    </div>
  )
}
