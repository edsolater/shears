import { AnyObj, flap, mergeFunction, parallelSwitch, shakeNil, unifyItem } from '@edsolater/fnkit'
import { ValidProps } from '../types/tools'
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

  const merged = Object.defineProperties(
    {},
    getObjKey(trimedProps).reduce((acc: any, key: any) => {
      acc[key] = {
        enumerable: true,
        get() {
          return getPivPropsValue(trimedProps, key)
        }
      }
      return acc
    }, {} as PropertyDescriptorMap)
  ) as Exclude<P, undefined>

  return merged
}
function getPivPropsValue(objs: AnyObj[], key: keyof any) {
  switch (key) {
    // -------- specific --------
    case 'children':
      for (let i = 0; i < objs.length; i++) {
        const obj = objs[i]
        const v = obj[key]
        if (v != null) return v
      }

    // -------- pivprops --------
    case 'ref':
      return objs.reduce((finalValue, objB) => {
        const valueB = objB[key]
        return valueB && finalValue ? mergeRefs(finalValue as any, valueB as any) : valueB ?? finalValue
      }, undefined as unknown)
    case 'class':
    case 'style':
    case 'icss':
    case 'htmlProps':
    case 'showProps':
    case 'plugin':
    case 'dangerousRenderWrapperNode':
      return objs.reduce((finalValue, objB) => {
        const valueB = objB[key]
        return valueB && finalValue ? [finalValue, valueB].flat() : valueB ?? finalValue
      }, undefined as unknown)
    // -------- normal props --------
    default: {
      // -------- 'on' callback function --------
      if (key.toString().startsWith('on')) {
        return objs.reduce((finalValue, objB) => {
          const valueB = objB[key]
          return valueB && finalValue ? mergeFunction(finalValue, valueB) : valueB ?? finalValue
        }, undefined as unknown)
      } else {
        // -------- very normal props --------
        for (let i = objs.length - 1; i >= 0; i--) {
          const obj = objs[i]
          const v = obj[key]
          if (v != null) return v
        }
      }
    }
  }
}

function mergeObjectsWithConfigs<T extends object>(
  objs: T[],
  coverRules: [propertyName: string, fn: (valueA: unknown, valueB: unknown) => unknown][]
): T {
  if (objs.length === 0) return {} as T
  if (objs.length === 1) return objs[0]!

  return Object.defineProperties(
    {},
    getObjKey(objs).reduce((acc: any, key: any) => {
      acc[key] = {
        enumerable: true,
        get() {
          return getObjValue(objs, key, coverRules)
        }
      }
      return acc
    }, {} as PropertyDescriptorMap)
  ) as T
}

function getObjValue<T extends AnyObj>(
  objs: T[],
  key: keyof any,
  coverRules: [propertyName: keyof any, fn: (valueA: unknown, valueB: unknown) => unknown][]
) {
  const targetCoverRule = coverRules.find(([propertyName]) => propertyName === key)?.[1]
  if (targetCoverRule) {
    return objs.reduce((finalValue, objB) => {
      const valueB = objB[key]
      return valueB ? targetCoverRule(finalValue, valueB) : finalValue
    }, undefined as unknown)
  } else {
    for (let i = objs.length - 1; i >= 0; i--) {
      const obj = objs[i]
      const v = obj[key]
      if (v != null) return v
    }
  }
}

function getObjKey<T extends object>(objs: T[]) {
  return unifyItem(
    objs.flatMap((obj) => {
      const descriptors = Object.getOwnPropertyDescriptors(obj) // 🤔 necessary?
      return Reflect.ownKeys(descriptors)
    })
  )
}
