/**
 * **CSS Utility Function**
 * @example
 * css_var('--accent-color') // => 'var(--accent-color)'
 * @returns css var()
 */

export function cssVar(name: string, defaultValue?: string) {
  return defaultValue ? `var(${name}, ${defaultValue})` : `var(${name})`
}
