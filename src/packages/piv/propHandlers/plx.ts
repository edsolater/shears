import { AnyObj, flapDeep, isFunction, MayDeepArray, overwriteFunctionName, shakeNil } from '@edsolater/fnkit'
import { KitProps } from '../createKit'
import { PivProps } from '../types/piv'
import { mergeProps } from '../utils/mergeProps'
import { omit } from '../utils/omit'

type PlxInnerFn = (componentProps: any) => any
type PlxInnerObj = {
  corefn: PlxInnerFn
  priority?: number
}
type Plx = PlxInnerFn | PlxInnerObj

export function handlePlxProps<P extends AnyObj>(props: P) {
  if (!props?.plx) return props

  function mergePlxReturnedProps<T extends AnyObj>(utils: {
    plxs: MayDeepArray<Plx | undefined>
    props: T & PivProps
  }): T & PivProps {
    return utils.plxs
      ? shakeNil(flapDeep(utils.plxs)).reduce((acc, plx) => mergeProps(acc, invokePlugin(plx, acc)), utils.props)
      : utils.props
  }
  function invokePlugin(plugin: Plx, props: KitProps<any>) {
    return isFunction(plugin) ? plugin(props) : plugin.corefn?.(props)
  }

  return omit(mergePlxReturnedProps({ plxs: props.plx, props }), 'plx')
}

/**
 * create normal plx
 * it will merge returned props
 * @example
 *  <Icon
 *    src='/delete.svg'
 *    icss={{ color: 'crimson' }}
 *    plx={[
 *      click({ onClick: () => onDeleteItem?.(item) }),
 *      Kit((self) => (
 *        <Tooltip placement='right' renderButton={self}>
 *          delete
 *        </Tooltip>
 *      ))
 *    ]}
 *  />
 */
export function createPlxCreator<Creater extends (...params: any[]) => (props: PivProps) => Partial<PivProps>>(
  createrFn: Creater, // return a function , in this function can exist hooks
  options?: {
    priority?: number // NOTE -1:  it should be render after final prop has determine
    name?: string
  },
): (...params: Parameters<Creater>) => Plx {
  const fn = (...params: Parameters<Creater>) => ({
    corefn: createrFn(params),
    priority: options?.priority,
  })
  const newFn = options?.name ? overwriteFunctionName(fn, options.name) : fn
  return newFn
}
