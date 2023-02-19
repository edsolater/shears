import { flapDeep, omit } from '@edsolater/fnkit'
import { PivProps } from '../../types/piv'
import { mergeProps } from '../prop-builders/mergeProps'

export function handleShadowProps<P extends Partial<PivProps<any>>>(props: P): Omit<P, 'shadowProps'> {
  if (!props?.shadowProps) return props
  console.log('props, props.shadowProps: ', props, props.shadowProps)
  return mergeProps(props, ...flapDeep(props.shadowProps)) as Omit<P, 'shadowProps'>
}
