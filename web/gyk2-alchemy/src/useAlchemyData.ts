import { useEffect, useState } from 'react'
import type { Ingredient, Recipe, Solution, IngredientsFile, RecipesFile, PairsFile } from './types'

interface AlchemyData {
  ingredients: Ingredient[]
  recipes: Recipe[]
  pairs: Solution[]
  triples: Solution[]
  loading: boolean
  error: string | null
}

export function useAlchemyData(): AlchemyData {
  const [state, setState] = useState<AlchemyData>({
    ingredients: [],
    recipes: [],
    pairs: [],
    triples: [],
    loading: true,
    error: null,
  })

  useEffect(() => {
    const base = import.meta.env.BASE_URL
    Promise.all([
      fetch(`${base}data/ingredients.json`).then(r => r.json() as Promise<IngredientsFile>),
      fetch(`${base}data/recipes.json`).then(r => r.json() as Promise<RecipesFile>),
      fetch(`${base}data/pairs.json`).then(r => r.json() as Promise<PairsFile>),
    ])
      .then(([ing, rec, pairs]) => {
        setState({
          ingredients: ing.ingredients,
          recipes: rec.recipes,
          pairs: pairs.pairs,
          triples: pairs.triples,
          loading: false,
          error: null,
        })
      })
      .catch(err => {
        setState(s => ({ ...s, loading: false, error: String(err) }))
      })
  }, [])

  return state
}
