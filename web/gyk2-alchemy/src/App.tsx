import { useMemo, useState } from 'react'
import { useAlchemyData } from './useAlchemyData'
import { colorsEqual, sumColors } from './colors'
import { RecipeRow } from './components/RecipeRow'
import { IngredientRow } from './components/IngredientRow'
import { SolutionCard } from './components/SolutionCard'
import { LocationFilter } from './components/LocationFilter'
import type { Recipe, Solution } from './types'
import './App.css'

function isAccessible(solution: Solution, excluded: Set<string>): boolean {
  if (excluded.size === 0) return true
  return solution.Ingredients.every(ing =>
    !ing.locations.some(loc => excluded.has(loc))
  )
}

function App() {
  const { ingredients, recipes, pairs, triples, loading, error } = useAlchemyData()
  const [selected, setSelected] = useState<Recipe | null>(null)
  const [excludedLocations, setExcludedLocations] = useState<Set<string>>(new Set())

  const allLocations = useMemo(() => {
    const locs = new Set<string>()
    for (const ing of ingredients) {
      for (const loc of ing.locations) locs.add(loc)
    }
    return Array.from(locs).sort()
  }, [ingredients])

  function handleRecipeClick(recipe: Recipe) {
    setSelected(prev => (prev?.name === recipe.name ? null : recipe))
  }

  const matchingPairs = selected
    ? pairs.filter(s =>
        colorsEqual(sumColors(s.Ingredients), selected.ingredients) &&
        isAccessible(s, excludedLocations)
      )
    : []
  const matchingTriples = selected
    ? triples.filter(s =>
        colorsEqual(sumColors(s.Ingredients), selected.ingredients) &&
        isAccessible(s, excludedLocations)
      )
    : []

  if (loading) return <div className="status">Loading…</div>
  if (error)   return <div className="status error">Error: {error}</div>

  return (
    <div className="app">
      <h1 className="site-title">Graveyard Keeper 2 Alchemy Solver</h1>
      <div className="top-panel">
        <section className="panel">
          <h2>Recipes</h2>
          <ul className="item-list">
            {recipes.map(r => (
              <RecipeRow
                key={r.name}
                recipe={r}
                selected={selected?.name === r.name}
                onClick={handleRecipeClick}
              />
            ))}
          </ul>
        </section>

        <section className="panel">
          <h2>Ingredients</h2>
          <ul className="item-list">
            {ingredients.map(i => (
              <IngredientRow key={i.name} ingredient={i} />
            ))}
          </ul>
        </section>
      </div>

      <LocationFilter
        locations={allLocations}
        excluded={excludedLocations}
        onChange={setExcludedLocations}
      />

      {selected && (
        <section className="solutions-panel">
          <h2>Solutions for <em>{selected.name}</em></h2>

          {matchingPairs.length === 0 && matchingTriples.length === 0 && (
            <p className="no-solutions">No solutions found.</p>
          )}

          {matchingPairs.length > 0 && (
            <>
              <h3>Pairs ({matchingPairs.length})</h3>
              <div className="solution-grid">
                {matchingPairs.map((s, i) => <SolutionCard key={i} solution={s} />)}
              </div>
            </>
          )}

          {matchingTriples.length > 0 && (
            <>
              <h3>Triples ({matchingTriples.length})</h3>
              <div className="solution-grid">
                {matchingTriples.map((s, i) => <SolutionCard key={i} solution={s} />)}
              </div>
            </>
          )}
        </section>
      )}
    </div>
  )
}

export default App
