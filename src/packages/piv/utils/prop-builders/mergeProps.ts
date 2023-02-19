import {
  AnyFn,
  flap,
  isArray,
  isFunction,
  isObject,
  mergeObjectsWithConfigs,
  parallelSwitch,
  shakeNil,
  mergeFunction
} from '@edsolater/fnkit'
import { ValidProps } from '../../types/tools'
import { mergeRefs } from './mergeRefs'

export function mergeProps<P1 = ValidProps, P2 = ValidProps>(...propsObjs: [P1, P2]): Exclude<P1 & P2, undefined>
export function mergeProps<P1 = ValidProps, P2 = ValidProps, P3 = ValidProps>(
  ...propsObjs: [P1, P2, P3]
): Exclude<P1 & P2 & P3, undefined>
export function mergeProps<P1 = ValidProps, P2 = ValidProps, P3 = ValidProps, P4 = ValidProps>(
  ...propsObjs: [P1, P2, P3, P4]
): Exclude<P1 & P2 & P3 & P4, undefined>
export function mergeProps<P1 = ValidProps, P2 = ValidProps, P3 = ValidProps, P4 = ValidProps, P5 = ValidProps>(
  ...propsObjs: [P1, P2, P3, P4, P5]
): Exclude<P1 & P2 & P3 & P4 & P5, undefined>
export function mergeProps<P extends ValidProps | undefined>(...propsObjs: P[]): Exclude<P, undefined>
export function mergeProps<P extends ValidProps | undefined>(...propsObjs: P[]): Exclude<P, undefined> {
  // @ts-ignore
  if (propsObjs.length <= 1) return propsObjs[0] ?? {}
  const trimedProps = shakeNil(flap(propsObjs))
  // @ts-ignore
  if (trimedProps.length <= 1) return trimedProps[0] ?? {}

  const mergedResult = mergeObjectsWithConfigs(trimedProps, ({ key, valueA: v1, valueB: v2 }) => {
    return parallelSwitch(
      key,
      [
        // special div props
        ['domRef', () => (v1 && v2 ? mergeRefs(v1 as any, v2 as any) : v1 ?? v2)],
        ['className', () => (v1 && v2 ? [v1, v2].flat() : v1 ?? v2)],
        ['style', () => (v1 && v2 ? [v1, v2].flat() : v1 ?? v2)],
        ['icss', () => (v1 && v2 ? [v1, v2].flat() : v1 ?? v2)],
        ['tag', () => (v1 && v2 ? [v1, v2].flat() : v1 ?? v2)],
        ['htmlProps', () => (v1 && v2 ? [v1, v2].flat() : v1 ?? v2)],
        ['shadowProps', () => (v1 && v2 ? [v1, v2].flat() : v1 ?? v2)],
        ['plugin', () => (v1 && v2 ? [v1, v2].flat() : v1 ?? v2)],
        ['dangerousRenderWrapperNode', () => (v1 && v2 ? [v1, v2].flat() : v1 ?? v2)],
        ['controller', () => (v1 && v2 ? [v1, v2].flat() : v1 ?? v2)],
        ['children', () => v2 ?? v1],

        // normal props
        [() => isFunction(v1) && isFunction(v2) && v1 !== v2, () => mergeFunction(v1 as AnyFn, v2 as AnyFn)],
        [() => isArray(v1) && isArray(v2) && v1 !== v2, () => (v1 as any[]).concat(v2)],
        [() => isObject(v1) && isObject(v2) && v1 !== v2, () => mergeProps(v1, v2)] // if v1 and v2 are react node, it will be a disaster // TODO: fix this
      ],
      v2 ?? v1
    )
  })
  // @ts-ignore
  return mergedResult
}
