import { flapDeep, MayDeepArray, omit } from '@edsolater/fnkit'
import { JSX } from 'solid-js'
import { PivProps } from './types/piv'
import { mergeProps } from './utils/prop-builders/mergeProps'

export type GetPluginProps<T> = T extends Plugin<infer Px1>
  ? Px1
  : T extends Plugin<infer Px1>[]
  ? Px1
  : T extends (Plugin<infer Px1> | Plugin<infer Px2>)[]
  ? Px1 & Px2
  : T extends (Plugin<infer Px1> | Plugin<infer Px2> | Plugin<infer Px3>)[]
  ? Px1 & Px2 & Px3
  : T extends (Plugin<infer Px1> | Plugin<infer Px2> | Plugin<infer Px3> | Plugin<infer Px4>)[]
  ? Px1 & Px2 & Px3 & Px4
  : T extends (Plugin<infer Px1> | Plugin<infer Px2> | Plugin<infer Px3> | Plugin<infer Px4> | Plugin<infer Px5>)[]
  ? Px1 & Px2 & Px3 & Px4 & Px5
  : unknown

export type Plugin<T> = {
  (additionalProps: Partial<T & PivProps>): Plugin<T>
  getProps?: (props: T & PivProps) => Partial<Omit<PivProps, 'plugin' | 'shadowProps'>>
  priority?: number // NOTE -1:  it should be calculated after final prop has determine
}

export function handlePluginProps<P extends Partial<PivProps>>(props: P) {
  if (!props?.plugin) return props
  console.log('propsii: ', props)
  return omit(mergePluginReturnedProps({ plugin: props.plugin, props }), 'plugin')
}

/**
 * merge additional props from plugin
 */
export function mergePluginReturnedProps<T>(utils: {
  plugin: MayDeepArray<Plugin<T>> | undefined
  props: T & PivProps
}): T & PivProps {
  return utils.plugin
    ? flapDeep(utils.plugin).reduce((acc, abilityPlugin) => mergeProps(acc, abilityPlugin.getProps?.(acc)), utils.props)
    : utils.props
}

/**
 * create special plugin
 * it will merge returned dangerousRenderWrapperNode props
 */
export function createWrapperNodePlugin<T>(
  createrFn: (insideNode: JSX.Element, outsideProps: T & PivProps) => JSX.Element,
  options?: {
    /** for DEBUG */
    name?: string
  }
): Plugin<T> {
  function pluginMiddleware(addtionalProps: any) {
    return createWrapperNodePlugin((node, props) => createrFn(node, mergeProps(addtionalProps, props)), options)
  }
  pluginMiddleware.getProps = (props: any) => ({ dangerousRenderWrapperNode: (node: any) => createrFn(node, props) })
  return pluginMiddleware
}

/**
 * create normal plugin
 * it will merge returned props
 * @example
 *  <Icon
 *    src='/delete.svg'
 *    icss={{ color: 'crimson' }}
 *    plugin={[
 *      click({ onClick: () => onDeleteItem?.(item) }),
 *      Kit((self) => (
 *        <Tooltip placement='right' renderButton={self}>
 *          delete
 *        </Tooltip>
 *      ))
 *    ]}
 *  />
 */
export function createPlugin<T>(
  createrFn: (props: T & PivProps) => Partial<Omit<T & PivProps, 'plugin' | 'shadowProps'>>, // return a function , in this function can exist hooks
  options?: {
    priority?: number // NOTE -1:  it should be render after final prop has determine
    name?: string
  }
): Plugin<T> {
  function pluginMiddleware(addtionalProps: any) {
    return createPlugin((props) => createrFn(mergeProps(addtionalProps, props)), options)
  }
  pluginMiddleware.getProps = (props: any) => createrFn(props)
  pluginMiddleware.priority = options?.priority

  return pluginMiddleware
}
