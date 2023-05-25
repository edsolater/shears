import { MayArray, flap } from '@edsolater/fnkit'
import { PivProps } from '../types/piv'
import { mergeProps } from '../utils/mergeProps'

export type PivShadowProps<OriginalProps> = MayArray<Partial<Omit<OriginalProps, 'as' | 'children'>>>

export function handleShadowProps<P extends Partial<PivProps<any>>>(props: P): Omit<P, 'shadowProps'> {
  return 'shadowProps' in props ? mergeProps(props, ...flap(props.shadowProps)) : props
}
