import { MayArray, shakeNil, unifyItem } from '@edsolater/fnkit'
import { pivPropsNames } from '../Piv'
import { PivProps } from '../types/piv'
import { getPivPropsValue } from '../utils/mergeProps'

export type PivShadowProps<OriginalProps> = MayArray<Partial<Omit<OriginalProps, 'as' | 'children'>>>

/** as will only calculate props when access, so, return verbose big object is ok */
export function handleShadowProps<P extends Partial<PivProps<any>>>(
  props: P,
  additionalShadowPropNames?: string[],
): Omit<P, 'shadowProps'> {
  if (!('shadowProps' in props)) return props
  const keys = unifyItem((pivPropsNames as string[]).concat(Object.keys(props)).concat(additionalShadowPropNames ?? []))
  const merged = Object.defineProperties(
    {},
    keys.reduce((acc: any, key: any) => {
      acc[key] = {
        enumerable: true,
        configurable: true,
        get() {
          const candidates = shakeNil([props].concat(props.shadowProps))
          return getPivPropsValue(candidates, key)
        },
      }
      return acc
    }, {} as PropertyDescriptorMap),
  ) as Exclude<P, undefined>
  return merged
}
