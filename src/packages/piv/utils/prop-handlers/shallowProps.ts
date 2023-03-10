import { flapDeep } from '@edsolater/fnkit'
import { PivProps } from '../../types/piv'
import { mergeProps } from '../prop-builders/mergeProps'

export function handleShadowProps<P extends Partial<PivProps<any>>>(props: P): Omit<P, 'shadowProps'> {
  if (!props?.shadowProps) return props
  return mergeProps(...flapDeep(props.shadowProps), props) as Omit<P, 'shadowProps'>
}
