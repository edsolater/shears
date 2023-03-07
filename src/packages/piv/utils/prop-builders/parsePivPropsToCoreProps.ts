import { flapDeep, merge, pipe, shakeFalsy, shakeNil } from '@edsolater/fnkit'
import { PivProps } from '../../types/piv'
import { classname } from '../classname'
import { parseCSSToString } from '../icss'
import { handlePluginProps } from '../prop-handlers/plugin'
import { handleShadowProps } from '../prop-handlers/shallowProps'
import { mergeRefs } from './mergeRefs'

// TODO: change props:icss will make all props to re-calc, this may cause performance issue
export function parsePivPropsToCoreProps(rawProps: PivProps<any>) {
  const props = pipe(rawProps as Partial<PivProps>, handleShadowProps, handlePluginProps)
  return {
    ...(props.htmlProps && Object.assign({}, ...shakeNil(flapDeep(props.htmlProps)))),
    class:
      shakeFalsy([classname(props.class), parseCSSToString(props.icss)]).join(' ') ||
      undefined /* don't render if empty string */,
    ref: (el: HTMLElement) => el && mergeRefs(...flapDeep(props.ref))(el),
    style: props.style ? merge(...shakeNil(flapDeep(props.style))) : undefined,
    onClick: props.onClick ? (ev: any) => props.onClick?.({ ev, el: ev.currentTarget }) : undefined,
    children: props.children
  }
}
