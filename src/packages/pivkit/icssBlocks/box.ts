import { CSSObject, ICSSObject } from '../piv'
import { cssColors } from '../styles/cssColors'

export type ICSSRowOptions = {
  gap?: CSSObject['gap']
  items?: CSSObject['alignItems']
  flexItem?: CSSObject['flex']
}

export const icss_row = (options?: ICSSRowOptions) =>
  ({
    display: 'flex',
    alignItems: options?.items ?? 'center',
    gap: options?.gap,
    '> *': {
      flex: options?.flexItem ?? '1 1 auto',
    },
  }) satisfies ICSSObject

export type ICSSColOptions = {
  gap?: CSSObject['gap']
  items?: CSSObject['alignItems']
  flexItem?: CSSObject['flex']
}

export const icss_col = (options?: ICSSColOptions) =>
  ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: options?.items ?? 'center',
    gap: options?.gap,
    '> *': {
      flex: options?.flexItem ?? '1 1 auto',
    },
  }) satisfies ICSSObject

export const icss_grid = (options?: {
  gap?: CSSObject['gap']
  items?: CSSObject['alignItems']
  flexItem?: CSSObject['flex']
}) => ({ display: 'grid', gap: options?.gap }) satisfies ICSSObject

export const icss_card = (options?: { gap?: CSSObject['gap']; items?: CSSObject['alignItems'] }) =>
  ({
    display: 'grid',
    border: 'solid',
    padding: '24px',
    borderRadius: '16px',
  }) satisfies ICSSObject

export const icss_clickable = (options?: {}) =>
  ({
    cursor: 'pointer',
    transition: 'all 80ms',
    '&:is(:hover,:active)': { backdropFilter: 'brightness(0.95)', filter: 'brightness(0.95)' },
  }) satisfies ICSSObject

export const icss_label = (options?: { w: CSSObject['minWidth']; h: CSSObject['minHeight'] }) =>
  ({
    minWidth: options?.w ?? '5em',
    minHeight: options?.h ?? 'calc(2em)',
    textAlign: 'center',
    paddingBlock: '.25em',
    paddingInline: '.5em',
    borderRadius: '4px',
    background: cssColors.component_label_bg_default,
  }) satisfies ICSSObject

export const icss_inputType = (options?: { w: CSSObject['minWidth']; h: CSSObject['minHeight'] }) =>
  ({
    minWidth: '12em',
    paddingBlock: '.25em',
    paddingInline: '.5em',
    // borderRadius: 4,
    // background: cssColors.component_input_bg_default,
    // outlineColor: cssColors.dodgerBlue,
    borderBottom: 'solid',
  }) satisfies ICSSObject
