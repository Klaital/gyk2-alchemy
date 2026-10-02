import type { AlchemyColors } from '../types'
import { colorStyle } from '../colors'

interface Props {
  colors: AlchemyColors
}

export function ColorSwatch({ colors }: Props) {
  return (
    <span
      className="color-swatch"
      style={{ backgroundColor: colorStyle(colors) }}
      title={`r:${colors.r} g:${colors.g} b:${colors.b}`}
    />
  )
}
