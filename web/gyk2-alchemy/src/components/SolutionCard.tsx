import type { Solution } from '../types'

interface Props {
  solution: Solution
}

export function SolutionCard({ solution }: Props) {
  return (
    <div className="solution-card">
      {solution.Ingredients.map((ing, i) => (
        <span key={i} className="solution-ingredient">
          <span>{ing.name}</span>
        </span>
      ))}
    </div>
  )
}
