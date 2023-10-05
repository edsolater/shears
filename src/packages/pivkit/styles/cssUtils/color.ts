import { isNumber, isObjectLiteral, isString, toPercentString } from '@edsolater/fnkit'

type ColorString = string

type ColorPercent = number | `${number}%`

type ColorItem = { /** ='currentColor' */ color?: ColorString; percent?: ColorPercent }

/**
 * **CSS Utility Function**
 * @example
 * css_colorMix('#fff', ['#000', 0.5]) // => 'color-mix(in srgb, #ffffff 50%, #000000 50%)'
 * @returns css color-mix()
 */
export function css_colorMix(...colors: (ColorString | ColorPercent | ColorItem)[]) {
  const colorItems = getColorItems(colors)
  const colorInfoList = colorItems.map(({ color, percent }) =>
    isColorPercent(percent) ? `${color} ${isNumber(percent) ? toPercentString(percent) : percent}` : color
  )
  return `color-mix(in srgb, ${colorInfoList.join(', ')})`
}


/**
 *
 * @example
 * getColorItems(['#fff', '60%', ['#000', 0.5]]) // => [{color: '#fff', percent: 0.6}, {color: '#000', percent: 0.5}]
 */
function getColorItems(colors: (ColorString | ColorPercent | ColorItem)[]): ColorItem[] {
  const composedColorItems: ColorItem[] = []
  let tempRecordColorItem: ColorItem = {}
  for (const item of colors) {
    if (isColorItem(item)) {
      const prev = tempRecordColorItem
      composedColorItems.push(prev)
      tempRecordColorItem = item
    }

    if (isColorString(item)) {
      const prevIsFulfilled = tempRecordColorItem.color
      if (prevIsFulfilled) {
        const prev = tempRecordColorItem
        composedColorItems.push(prev)
        tempRecordColorItem = { color: item }
      } else {
        tempRecordColorItem.color = item
      }
    }

    if (isColorPercent(item)) {
      tempRecordColorItem.percent = item
    }
  }

  composedColorItems.push(tempRecordColorItem)

  return composedColorItems
}

function isColorString(c: ColorPercent | ColorString | ColorItem | undefined): c is ColorString {
  return isString(c) && !isColorPercent(c)
}

function isColorPercent(c: ColorPercent | ColorString | ColorItem | undefined): c is ColorPercent {
  return typeof c === 'number' || (typeof c === 'string' && c.endsWith('%'))
}

function isColorItem(c: ColorPercent | ColorString | ColorItem | undefined): c is ColorItem {
  return isObjectLiteral(c)
}
/**
 * **CSS Utility Function**
 * 
 * @param transparentPercent 0~1
 * @returns color-mix() string
 */
export function css_opacity(color: string, alpha: number) {
  return css_colorMix(color, 'transparent', 1 - alpha)
}

export function css_lighten(color: string, alpha: number) {
  return css_colorMix(color, 'white', alpha)
}

export function css_darken(color: string, alpha: number) {
  return css_colorMix(color, 'black', alpha)
}

export function css_grayscale(color: string, alpha: number) {
  return css_colorMix(color, 'gray', alpha)
}