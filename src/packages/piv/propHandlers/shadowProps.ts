import { MayArray, flapDeep } from '@edsolater/fnkit'
import { PivProps } from '../types/piv'
import { mergeProps } from '../utils/mergeProps'
import { omit } from '../utils/omit'

export type PivShadowProps<OriginalProps> = MayArray<Partial<Omit<OriginalProps, 'as' | 'children'>>>

export function handleShadowProps<P extends Partial<PivProps<any>>>(props: P): Omit<P, 'shadowProps'> {
  if (!props?.shadowProps) return props
  const shasd = flapDeep(props.shadowProps).map((p) => omit(p, ['children'])) // omit children will loose 
  console.log('shasd: ', shasd)
  return mergeProps(props, ...flapDeep(props.shadowProps)) as Omit<P, 'shadowProps'>
}
