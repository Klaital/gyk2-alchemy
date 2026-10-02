import type { AlchemyColors, Ingredient } from './types'

export function sumColors(ingredients: Ingredient[]): AlchemyColors {
  return ingredients.reduce(
    (sum, ing) => ({ r: sum.r + ing.colors.r, g: sum.g + ing.colors.g, b: sum.b + ing.colors.b }),
    { r: 0, g: 0, b: 0 }
  )
}

export function colorsEqual(a: AlchemyColors, b: AlchemyColors): boolean {
  return a.r === b.r && a.g === b.g && a.b === b.b
}

export function colorStyle(c: AlchemyColors): string {
  return `rgb(${c.r}, ${c.g}, ${c.b})`
}
