import { CSSObject, ICSSObject } from '../../piv/propHandlers/icss';

export const icssBlock_row = (options?: { gap?: CSSObject['gap']; items?: CSSObject['alignItems'] }) =>
  ({
    display: 'flex',
    alignItems: options?.items ?? 'center',
    gap: options?.gap
  } satisfies ICSSObject)
