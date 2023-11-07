/**
 * **************************
 * **misc** for undetermined styles
 * **************************
 */

import { createICSS } from '../../piv'
import { cssOpacity } from '../cssUtils'

/** for childrens (items or item-group) */
export const icssDivider = createICSS(() => ({
  '& > :not(:last-child)': {
    borderBottom: `thin solid ${cssOpacity('currentColor', 0.1)}`,
  },
}))
