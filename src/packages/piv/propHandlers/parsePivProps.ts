import { flapDeep, merge, pipe, shakeFalsy, shakeNil } from '@edsolater/fnkit'
import { PivProps } from '../types/piv'
import { classname } from './classname'
import { parseCSSToString } from './icss'
import { handlePluginProps } from './plugin'
import { handleShadowProps } from './shadowProps'
import { mergeRefs } from '../utils/mergeRefs'
import { parseIStyles } from './istyle'
import { objectMerge } from '../../fnkit/objectMerge'

// TODO: change props:icss will make all props to re-calc, this may cause performance issue
export function parsePivProps(rawProps: PivProps<any>) {
  const props = pipe(rawProps as Partial<PivProps>, handleShadowProps, handlePluginProps)
  return {
    ...(props.htmlProps && Object.assign({}, ...shakeNil(flapDeep(props.htmlProps)))),
    class:
      shakeFalsy([
        classname(props.class, props.transmittedController),
        parseCSSToString(props.icss, props.transmittedController)
      ]).join(' ') || undefined /* don't render if empty string */,
    ref: (el: HTMLElement) => el && mergeRefs(...flapDeep(props.ref))(el),
    style: parseIStyles(props.style, props.transmittedController),
    onClick:
      'onClick' in props
        ? (ev: any) => props.onClick?.(objectMerge(props.transmittedController ?? {}, { ev, el: ev.currentTarget }))
        : undefined,
    children: props.children
  }
}


