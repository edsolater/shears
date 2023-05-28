import { MayArray, shakeNil } from '@edsolater/fnkit'
import { pivPropsNames } from '../Piv'
import { PivProps } from '../types/piv'
import { getPivPropsValue } from '../utils/mergeProps'
import { createEmptyObject } from './parsePivProps'

export type PivShadowProps<OriginalProps> = MayArray<Partial<Omit<OriginalProps, 'as' | 'children'>>>

export function handleShadowProps<P extends Partial<PivProps<any>>>(
  props: P,
  shadowPropNames: string[] = pivPropsNames,
): Omit<P, 'shadowProps'> {
  const merged = Object.defineProperties(
    createEmptyObject(shadowPropNames),
    shadowPropNames.reduce((acc: any, key: any) => {
      acc[key] = {
        enumerable: true,
        get() {
          const candidates = shakeNil([props].concat(props.shadowProps))
          return getPivPropsValue(candidates, key)
        },
      }
      return acc
    }, {} as PropertyDescriptorMap),
  ) as unknown as Exclude<P, undefined>
  return 'shadowProps' in props ? merged : props
}
