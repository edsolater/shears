import { FormatOptions, div, parseNumberInfo, toFormatedNumber } from '@edsolater/fnkit'
import { Numberish } from '../dataStructures/type'
/**
 * it depends on 'toFixed'
 */
export default function toUsdVolume(
  amount: Numberish | undefined,
  options?: {
    shortcut?: boolean
  } & FormatOptions,
) {
  if (!amount) return '$0'
  return `$${
    options?.shortcut
      ? toShortcutNumber(amount, { fractionLength: 2, ...options })
      : toFormatedNumber(amount, { fractionLength: 2, ...options })
  }`
}

/**
 * 1000 => 1K
 * 1000000 => 1M
 * 1000000000 => 1B
 * 1000000000000 => 1T
 */
export function toShortcutNumber(
  n: Numberish,
  options?: {
    disabled?: boolean
  } & FormatOptions,
): string {
  const formatFn = (n: Numberish) =>
    toFormatedNumber(n, {
      fractionLength: 'auto',
      ...options,
    })
  try {
    const { int = '' } = parseNumberInfo(n)
    const numberWeigth = int.length
    if (!options?.disabled && numberWeigth > 3 * 4) return `${formatFn(div(n, 1e12))}T`
    if (!options?.disabled && numberWeigth > 3 * 3) return `${formatFn(div(n, 1e9))}B`
    if (!options?.disabled && numberWeigth > 3 * 2) return `${formatFn(div(n, 1e6))}M`
    if (!options?.disabled && numberWeigth > 3 * 1) return `${formatFn(div(n, 1e3))}K`
    return `${formatFn(n)}`
  } catch {
    return '0'
  }
}
