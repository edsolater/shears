import { flapDeep, pipe, shakeFalsy } from '@edsolater/fnkit'
import { PivProps } from '../types/piv'
import { ValidController } from '../types/tools'
import { mergeRefs } from '../utils/mergeRefs'
import { classname } from './classname'
import { applyPivController } from './controller'
import { parseHTMLProps } from './htmlProps'
import { parseCSSToString } from './icss'
import { parseIStyles } from './istyle'
import { parseOnClick } from './onClick'
import { handlePluginProps } from './plugin'
import { handleShadowProps } from './shadowProps'

// TODO: change props:icss will make all props to re-calc, this may cause performance issue
export function parsePivProps(rawProps: PivProps<any>) {
  const props = pipe(rawProps as Partial<PivProps>, handleShadowProps, handlePluginProps)
  const controller = (props.inputController ?? {}) as ValidController
  return {
    ...parseHTMLProps(props.htmlProps, controller),
    class:
      shakeFalsy([classname(props.class, controller), parseCSSToString(props.icss, controller)]).join(' ') ||
      undefined /* don't render if empty string */,
    ref: (el: HTMLElement) => el && mergeRefs(...flapDeep(props.ref))(el),
    style: parseIStyles(props.style, controller),
    onClick: 'onClick' in props ? parseOnClick(props.onClick!, controller) : undefined,
    children: applyPivController(props.children, controller)
  }
}
