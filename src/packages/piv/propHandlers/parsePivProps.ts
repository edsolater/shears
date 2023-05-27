import { flap, pipe, shakeFalsy } from '@edsolater/fnkit'
import { PivProps } from '../types/piv'
import { ValidController } from '../types/tools'
import { mergeRefs } from '../utils/mergeRefs'
import { classname } from './classname'
import { parsePivChildren } from './controller'
import { mergeObjects, parseHTMLProps } from './htmlProps'
import { parseCSSToString } from './icss'
import { parseIStyles } from './istyle'
import { parseOnClick } from './onClick'
import { handlePluginProps } from './plugin'
import { handleShadowProps } from './shadowProps'
import { children } from 'solid-js'

/**
 * Parses the PivProps object and returns an object with the parsed properties.
 * @param rawProps - The raw PivProps object to be parsed.
 * @returns An object with the parsed properties.
 */
// TODO: props should be lazy load, props.htmlProps should also be lazy load
export function parsePivProps(rawProps: PivProps<any>) {
  const props = pipe(
    rawProps as Partial<PivProps>,
    handleShadowProps,
    handlePluginProps,
    parsePivRenderPrependChildren,
    parsePivRenderAppandChildren
  )
  const controller = (props.inputController ?? {}) as ValidController
  debugLog(rawProps, props, controller)
  return {
    ...parseHTMLProps(props.htmlProps, controller),
    get class() {
      // getter for lazy solidjs render
      return (
        shakeFalsy([classname(props.class, controller), parseCSSToString(props.icss, controller)]).join(' ') ||
        undefined
      ) /* don't render if empty string */
    },
    get ref() {
      return (el: HTMLElement) => el && mergeRefs(...flap(props.domRef))(el)
    },
    get style() {
      const props = pipe(rawProps as Partial<PivProps>, handleShadowProps, handlePluginProps)
      const controller = (props.inputController ?? {}) as ValidController
      return parseIStyles(props.style, controller)
    },
    get onClick() {
      return 'onClick' in props ? parseOnClick(props.onClick!, controller) : undefined
    },
    get children() {
      return parsePivChildren(props.children, controller)
    }
  }
}

/**
 * Parses the PivProps's render:prepend.
 * @param props - The raw PivProps object to be parsed.
 * @param controller - The controller object to be used for parsing.
 * @returns new props with the parsed properties and prepended children.
 */
function parsePivRenderPrependChildren<T extends Partial<PivProps<any, any>>>(
  props: T
): Omit<T, 'render:prepend'> {
  if (!('render:prepend' in props)) return props
  return Object.defineProperty(props, 'children', {
    enumerable: true,
    writable: true,
    configurable: true,
    get() {
      // @ts-expect-error no need to be JSXElement
      const newChildren = children(() => flap(props['render:prepend']).concat(props.children))
      return newChildren
    }
  })
}

/**
 * Parses the PivProps's render:append.
 * @param props - The raw PivProps object to be parsed.
 * @param controller - The controller object to be used for parsing.
 * @returns new props with the parsed properties and appended children.
 */
function parsePivRenderAppandChildren<T extends Partial<PivProps<any, any>>>(
  props: T
): Omit<T, 'render:append'> {
  if (!('render:append' in props)) return props
  return Object.defineProperty(props, 'children', {
    enumerable: true,
    writable: true,
    configurable: true,
    get() {
      // @ts-expect-error no need to be JSXElement
      const newChildren = children(() => flat(props.children).concat(flap(props['render:append'])))
      return newChildren
    }
  })
}

/**
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/console/debug
 */
function debugLog(rawProps: PivProps<any>, props: PivProps<any>, controller: ValidController) {
  if (props.debugLog) {
    if (props.debugLog.includes('shadowProps')) {
      console.debug('shadowProps (raw): ', rawProps.shadowProps)
    }
    if (props.debugLog.includes('plugin')) {
      console.debug('plugin (raw): ', rawProps.plugin)
    }
    if (props.debugLog.includes('htmlProps')) {
      console.debug('htmlProps (raw → parsed): ', props.htmlProps, { ...parseHTMLProps(props.htmlProps, controller) })
    }
    if (props.debugLog.includes('icss')) {
      console.debug('icss (raw → parsed): ', props.icss, parseCSSToString(props.icss, controller))
    }
    if (props.debugLog.includes('style')) {
      console.debug('style (raw → parsed): ', props.style, parseIStyles(props.style, controller))
    }
    if (props.debugLog.includes('class')) {
      console.debug('class (raw → parsed): ', props.class, classname(props.class, controller))
    }
    if (props.debugLog.includes('inputController')) {
      console.debug('inputController (raw → parsed): ', props.inputController)
    }
    if (props.debugLog.includes('onClick')) {
      console.debug(
        'onClick (raw → parsed): ',
        props.onClick,
        'onClick' in props && parseOnClick(props.onClick!, controller)
      )
    }
    if (props.debugLog.includes('children')) {
      console.debug('children', props.children)
    }
  }
}
