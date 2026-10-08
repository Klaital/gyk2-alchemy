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

const CORPSE_INGREDIENTS = new Set(['Salt', 'Ash', 'Minced meat', 'Brain', 'Blood', 'Heart', 'Flesh', 'Tooth'])

function App() {
  const { ingredients, recipes, pairs, triples, loading, error } = useAlchemyData()
  const [selected, setSelected] = useState<Recipe | null>(null)
  const [excludedLocations, setExcludedLocations] = useState<Set<string>>(new Set())
  const [excludedIngredients, setExcludedIngredients] = useState<Set<string>>(new Set())

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

  const allCorpseExcluded = Array.from(CORPSE_INGREDIENTS).every(n => excludedIngredients.has(n))

  function toggleCorpseIngredients() {
    setExcludedIngredients(prev => {
      const next = new Set(prev)
      if (allCorpseExcluded) {
        CORPSE_INGREDIENTS.forEach(n => next.delete(n))
      } else {
        CORPSE_INGREDIENTS.forEach(n => next.add(n))
      }
      return next
    })
  }

  function handleIngredientClick(ingredient: { name: string }) {
    setExcludedIngredients(prev => {
      const next = new Set(prev)
      if (next.has(ingredient.name)) next.delete(ingredient.name)
      else next.add(ingredient.name)
      return next
    })
  }

  function solutionMatches(s: Solution): boolean {
    if (!selected) return false
    if (!colorsEqual(sumColors(s.Ingredients), selected.ingredients)) return false
    if (!isAccessible(s, excludedLocations)) return false
    if (s.Ingredients.some(ing => excludedIngredients.has(ing.name)))
      return false
    return true
  }

  const matchingPairs   = selected ? pairs.filter(solutionMatches)   : []
  const matchingTriples = selected ? triples.filter(solutionMatches) : []

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
          <div className="panel-header">
            <h2>Ingredients</h2>
            <button
              className={`shortcut-btn${allCorpseExcluded ? ' active' : ''}`}
              onClick={toggleCorpseIngredients}
            >
              Exclude corpse
            </button>
          </div>
          <ul className="item-list">
            {ingredients.map(i => (
              <IngredientRow
                key={i.name}
                ingredient={i}
                selected={excludedIngredients.has(i.name)}
                onClick={handleIngredientClick}
              />
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
          <div className="recipe-detail">
            <h2>{selected.name}</h2>
            <div className="color-requirements">
              <span className="color-req red">R: {selected.ingredients.r}</span>
              <span className="color-req green">G: {selected.ingredients.g}</span>
              <span className="color-req blue">B: {selected.ingredients.b}</span>
            </div>
          </div>

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
