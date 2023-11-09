/**
 * **************************
 * **misc** for undetermined styles
 * **************************
 */

import { isArray, mergeObjects } from '@edsolater/fnkit'
import { createICSS } from '../../piv'
import { cssOpacity, cssVar } from '../cssValues'

/** for childrens (items or item-group) */
export const icssDivider = createICSS(() => ({
  '& > :not(:last-child)': {
    borderBottom: `thin solid ${cssOpacity('currentColor', 0.1)}`,
  },
}))

// somethings can't use  currentColor,  so use this instead
export const icssTextColor = createICSS((options?: { color?: string | string[] }) =>
  mergeObjects(
    {
      '--current-color': (isArray(options?.color) ? options?.color[0] : options?.color) ?? cssVar('--secondary'),
      color: cssVar('--current-color'),
    },
    options && isArray(options?.color)
      ? mergeObjects(...options!.color.map((c, idx) => ({ [`--color-${idx}`]: c })))
      : undefined,
  ),
)
