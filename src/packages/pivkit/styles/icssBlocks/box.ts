import { createICSS, CSSObject } from '../../piv'
import { cssColors } from '../cssColors'

export type ICSSRowOption = {
  gap?: CSSObject['gap']
  items?: CSSObject['alignItems']
}

export const icssRow = createICSS(({ gap, items }: ICSSRowOption = {}) => ({
  display: 'flex',
  alignItems: items ?? 'center',
  gap: gap,
}))

export type ICSSColOption = {
  gap?: CSSObject['gap']
  items?: CSSObject['alignItems']
}

export const icssCol = createICSS(({ gap, items }: ICSSRowOption = {}) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: items,
  gap: gap,
}))

//#region ------------------- grid -------------------
export type ICSSGridOption = {
  gap?: CSSObject['gap']
  items?: CSSObject['placeItems']
  template?: CSSObject['gridTemplate']
  templateColumn?: CSSObject['gridTemplateColumns']
}

export const icssGrid = createICSS(({ items, template, templateColumn, gap }: ICSSGridOption = {}) => ({
  display: 'grid',
  placeItems: items,
  gridTemplate: template,
  gridTemplateColumns: templateColumn,
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
