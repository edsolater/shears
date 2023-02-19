import { mergeProps as solidjsMergeProps } from 'solid-js'
import { ValidProps } from '../../types/tools'
import { mergeProps } from './mergeProps'

export function addDefaultProps<T extends ValidProps>(props: T, ...defaultProps: Partial<T>[]) {
  return solidjsMergeProps(...defaultProps, props)
}
export function addDefaultPivProps<T extends ValidProps>(props: T, ...defaultProps: Partial<T>[]) {
  return mergeProps(...defaultProps, props)
}
