/**
 * **************************
 * **misc** for undetermined styles
 * **************************
 */

import { isArray, mergeObjects } from '@edsolater/fnkit'
import { ICSS, createICSS } from '../../piv'
import { cssOpacity, cssVar } from '../cssValues'

/** for childrens (items or item-group) */
export const icss_divider = createICSS(() => ({
  '& > :not(:last-child)': {
    borderBottom: `thin solid ${cssOpacity('currentColor', 0.1)}`,
  },
}))

// somethings can't use  currentColor,  so use this instead
export const icss_textColor = createICSS((options?: { color?: string | string[] }) =>
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

export const icss_cardPanel = createICSS((options?: { transparentCard?: boolean }) => ({
  backgroundColor: options?.transparentCard ? undefined : cssVar('--card-bg'),
  borderRadius: '0.5rem',
  boxShadow: `0 0 0.5rem 0 ${cssOpacity(cssVar('--card-bg'), 0.5)}`,
  padding: '.5em 1em',
}))
