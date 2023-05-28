import { flap, pipe, shakeFalsy } from '@edsolater/fnkit'
import { mutateByAdditionalObjectDescriptors } from '../../fnkit/mutateByAdditionalObjectDescriptors'
import { PivProps } from '../types/piv'
import { ValidController } from '../types/tools'
import { mergeRefs } from '../utils/mergeRefs'
import { classname } from './classname'
import { parsePivChildren } from './controller'
import { parseHTMLProps } from './htmlProps'
import { parseCSSToString } from './icss'
import { parseIStyles } from './istyle'
import { parseOnClick } from './onClick'
import { handlePluginProps } from './plugin'
import { handleShadowProps } from './shadowProps'

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
    parsePivRenderAppendChildren,
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
 * Parses the PivProps's render:prependChild.
 * @param props - The raw PivProps object to be parsed.
 * @param controller - The controller object to be used for parsing.
 * @returns new props with the parsed properties and prepended children.
 */
function parsePivRenderPrependChildren<T extends Partial<PivProps<any, any>>>(
  props: T
): Omit<T, 'render:prependChild'> {
  if (!props['render:prependChild']) return props
  return mutateByAdditionalObjectDescriptors(props, {
    newGetters: { children: (props) => flap(props['render:prependChild']).concat(props.children) },
    deletePropertyNames: ['render:prependChild']
  })
}

/**
 * Parses the PivProps's render:appendChild.
 * @param props - The raw PivProps object to be parsed.
 * @param controller - The controller object to be used for parsing.
 * @returns new props with the parsed properties and appended children.
 */
function parsePivRenderAppendChildren<T extends Partial<PivProps<any, any>>>(props: T): Omit<T, 'render:appendChild'> {
  if (!props['render:appendChild']) return props
  return mutateByAdditionalObjectDescriptors(props, {
    newGetters: { children: (props) => flap(props.children).concat(flap(props['render:appendChild'])) },
    deletePropertyNames: ['render:appendChild']
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
