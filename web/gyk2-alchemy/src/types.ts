export interface AlchemyColors {
  r: number
  g: number
  b: number
}

export interface Ingredient {
  name: string
  colors: AlchemyColors
  locations: string[]
}

export interface Recipe {
  name: string
  ingredients: AlchemyColors  // JSON key is "ingredients" per Go struct tag
}

export interface Solution {
  Ingredients: Ingredient[]   // capital I — no JSON tag in Go struct
}

export interface IngredientsFile { ingredients: Ingredient[] }
export interface RecipesFile    { recipes: Recipe[] }
export interface PairsFile      { pairs: Solution[]; triples: Solution[] }
