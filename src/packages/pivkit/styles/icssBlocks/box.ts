import { createICSS, CSSObject } from '../../piv'
import { cssColors } from '../cssColors'

export type ICSSRowOption = {
  gap?: CSSObject['gap']
  items?: CSSObject['alignItems']
  childItems?: CSSObject['flex']
}

export const icssRow = createICSS(({ gap, items = 'center', childItems = 'auto' }: ICSSRowOption = {}) => ({
  display: 'flex',
  alignItems: items,
  gap: gap,
  '> *': { flex: childItems },
}))

export type ICSSColOption = {
  gap?: CSSObject['gap']
  items?: CSSObject['alignItems']
  childItems?: CSSObject['flex']
}

export const icssCol = createICSS(({ gap, items, childItems = 'none' }: ICSSColOption = {}) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: items,
  gap: gap,
  '> *': { flex: childItems },
}))

//#region ------------------- grid -------------------
export type ICSSGridOption = {
  gap?: CSSObject['gap']
  items?: CSSObject['placeItems']
  template?: CSSObject['gridTemplate']
  templateRow?: CSSObject['gridTemplateRows']
  templateColumn?: CSSObject['gridTemplateColumns']
}

export const icssGrid = createICSS(({ items, template, templateColumn, templateRow, gap }: ICSSGridOption = {}) => ({
  display: 'grid',
  placeItems: items,
  gridTemplate: template,
  gridTemplateColumns: templateColumn,
  gridTemplateRows: templateRow,
  gap: gap,
}))

export type ICSSGridItemOption = {
  area?: CSSObject['gridArea']
}

export const icssGridItem = createICSS((opts: ICSSGridItemOption = {}) => ({
  gridArea: opts?.area,
}))

//#endregion

export type ICSSCardOption = {
  style?: 'big-card' | 'ghost'
  gap?: CSSObject['gap']
  items?: CSSObject['alignItems']
}
export const icssCard = createICSS((options: ICSSCardOption = {}) => ({
  display: 'grid',
  // backgroundColor: 'color-mix(in srgb, currentColor, transparent 95%)',
  background: options?.style === 'ghost' ? undefined : 'var(--big-card-bg, #ffffffcc)',
  /* generate by https://shadows.brumm.af/ */
  boxShadow:
    options?.style === 'ghost'
      ? undefined
      : `4.1px 4.1px 5.3px -23px rgba(0, 0, 0, 0.012),
           19.6px 19.6px 17.9px -23px rgba(0, 0, 0, 0.018),
           100px 100px 80px -23px rgba(0, 0, 0, 0.03)`,
  padding: '24px',
  borderRadius: '16px',
}))

export type ICSSClickableOption = {}

export const icssClickable = createICSS((options?: ICSSClickableOption) => ({
  cursor: 'pointer',
  ':is(:hover,:active)': { backdropFilter: 'brightness(0.9)', filter: 'brightness(0.9)' },
}))

export const icssLabel = createICSS((options?: { w?: CSSObject['minWidth']; h?: CSSObject['minHeight'] }) => ({
  minWidth: options?.w ?? '5em',
  minHeight: options?.h ?? 'calc(2em)',
  textAlign: 'center',
  paddingBlock: '.25em',
  paddingInline: '.5em',
  borderRadius: '4px',
  background: cssColors.component_label_bg_default,
}))

export const icssInputType = createICSS((options?: { w?: CSSObject['minWidth']; h?: CSSObject['minHeight'] }) => ({
  minWidth: '12em',
  paddingBlock: '.25em',
  paddingInline: '.5em',
  // borderRadius: '4px',
  // background: cssColors.component_input_bg_default,
  // outlineColor: cssColors.dodgerBlue,
  borderBottom: 'solid',
}))
