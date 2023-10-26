/**
 * **CSS Utility Function**
 * @example
 * css_var('--accent-color') // => 'var(--accent-color)'
 * @returns css var()
 */

export function css_var(name: string) {
  return `var(${name})`
}
