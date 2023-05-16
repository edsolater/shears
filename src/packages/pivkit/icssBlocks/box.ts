import { CSSObject, ICSSObject } from '../../piv/propHandlers/icss'

export const b_row = (options?: { gap?: CSSObject['gap']; items?: CSSObject['alignItems'] }) =>
  ({
    display: 'flex',
    alignItems: options?.items ?? 'center',
    gap: options?.gap
  } satisfies ICSSObject)

export const b_col = (options?: { gap?: CSSObject['gap']; items?: CSSObject['alignItems'] }) =>
  ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: options?.items ?? 'center',
    gap: options?.gap
  } satisfies ICSSObject)

export const b_card = (options?: { gap?: CSSObject['gap']; items?: CSSObject['alignItems'] }) =>
  ({
    display: 'grid',
    border: 'solid',
    padding: 16
  } satisfies ICSSObject)

export const b_clickable = (options?: {}) =>
  ({ cursor: 'pointer', ':is(:hover,:active)': { backdropFilter: 'brightness(0.9)' } } satisfies ICSSObject)
