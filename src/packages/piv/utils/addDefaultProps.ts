import { mergeProps as solidjsMergeProps } from 'solid-js'
import { ValidProps } from '../types/tools'
import { mergeProps } from './mergeProps'

/** use solidjs's mergeProps */
export function addDefaultProps<T extends ValidProps, const D>(
  props: T,
  defaultProps: D
): Omit<T, keyof D> & Pick<Required<T>, keyof D & string> {
  return solidjsMergeProps(defaultProps, props) as any
}

/** will consider icss/shadowPorps/class/etc. piv props */
export function addDefaultPivProps<T extends ValidProps>(props: T, ...defaultProps: Partial<T>[]) {
  return mergeProps(...defaultProps, props)
}

export type AddDefaultPivProps<T extends ValidProps, D = {}> = Omit<T, keyof D> & Pick<Required<T>, keyof D & string>
