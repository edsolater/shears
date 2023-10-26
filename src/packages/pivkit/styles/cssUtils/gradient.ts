import { CSSColorString } from '../type'

/**
 * **CSS Utility Function**
 * @example
 * @returns
 */
export function css_gradient(options: {
  /** @default 'to bottom' */
  direction?: 'to top' | 'to bottom' | 'to left' | 'to right'
  colors: CSSColorString[]
}): string {
  return `linear-gradient(${options.direction ?? 'to bottom'}, ${options.colors.join(', ')})`
}
