import { CSSObject, ICSSObject } from '../../piv/propHandlers/icss'

export const icssBlock_row = (options?: { gap?: CSSObject['gap']; items?: CSSObject['alignItems'] }) =>
  ({
    display: 'flex',
    alignItems: options?.items ?? 'center',
    gap: options?.gap
  } satisfies ICSSObject)
export const icssBlock_card = (options?: { padding?: CSSObject['gap'] }) =>
  ({
    display: 'grid',
    border: 'solid',
    padding: 16
  } satisfies ICSSObject)
