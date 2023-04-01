import { AnyObj, flapDeep, MayDeepArray, omit, overwriteFunctionName } from '@edsolater/fnkit'
import { JSX } from 'solid-js'
import { KitProps } from '../createKit'
import { PivProps } from '../types/piv'
import { mergeProps } from '../utils/propBuilders/mergeProps'

export type GetPluginProps<T> = T extends PluginCreator<infer Px1>
  ? Px1
  : T extends PluginCreator<infer Px1>[]
  ? Px1
  : T extends (PluginCreator<infer Px1> | PluginCreator<infer Px2>)[]
  ? Px1 & Px2
  : T extends (PluginCreator<infer Px1> | PluginCreator<infer Px2> | PluginCreator<infer Px3>)[]
  ? Px1 & Px2 & Px3
  : T extends (
      | PluginCreator<infer Px1>
      | PluginCreator<infer Px2>
      | PluginCreator<infer Px3>
      | PluginCreator<infer Px4>
    )[]
  ? Px1 & Px2 & Px3 & Px4
  : T extends (
      | PluginCreator<infer Px1>
      | PluginCreator<infer Px2>
      | PluginCreator<infer Px3>
      | PluginCreator<infer Px4>
      | PluginCreator<infer Px5>
    )[]
  ? Px1 & Px2 & Px3 & Px4 & Px5
  : unknown

export type PluginCreator<T extends Partial<PivProps>> = (additionalProps?: T) => Plugin<T>
export type Plugin<T extends Partial<PivProps>> = {
  pluginCoreFn?: (props: T & PivProps) => Partial<Omit<PivProps, 'plugin' | 'shadowProps'>>
  priority?: number // NOTE -1:  it should be calculated after final prop has determine
}

export function handlePluginProps<P extends Partial<PivProps>>(props: P) {
  if (!props?.plugin) return props
  return omit(mergePluginReturnedProps({ plugins: props.plugin, props }), 'plugin')
}

/**
 * merge additional props from plugin
 */
export function mergePluginReturnedProps<T extends Partial<PivProps>>(utils: {
  plugins: MayDeepArray<Plugin<T>> | undefined
  props: T & PivProps
}): T & PivProps {
  return utils.plugins
    ? flapDeep(utils.plugins).reduce(
        (acc, abilityPlugin) => mergeProps(acc, abilityPlugin.pluginCoreFn?.(acc)),
        utils.props
      )
    : utils.props
}

/**
 * create special plugin
 * it will merge returned dangerousRenderWrapperNode props
 */
export function createWrapperNodePlugin<T extends Partial<PivProps>>(
  createrFn: (insideNode: JSX.Element, outsideProps: T & PivProps) => JSX.Element,
  options?: {
    /** for DEBUG */
    name?: string
  }
): PluginCreator<T> {
  return overwriteFunctionName(
    (addtionalProps: any) => ({
      pluginCoreFn: (props: any) => ({
        dangerousRenderWrapperNode: (node: any) => createrFn(node, mergeProps(addtionalProps, props))
      })
    }),
    options?.name
  )
  // function pluginMiddleware(addtionalProps: any) {
  //   return createWrapperNodePlugin((node, props) => createrFn(node, mergeProps(addtionalProps, props)), options)
  // }
  // pluginMiddleware.pluginCoreFn = (props: any) => ({
  //   dangerousRenderWrapperNode: (node: any) => createrFn(node, props)
  // })
  // return pluginMiddleware
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
export function createPlugin<T extends AnyObj>(
  createrFn: (props: T & PivProps) => Partial<Omit<T & PivProps, 'plugin' | 'shadowProps'>>, // return a function , in this function can exist hooks
  options?: {
    priority?: number // NOTE -1:  it should be render after final prop has determine
    name?: string
  }
): PluginCreator<T> {
  return overwriteFunctionName(
    (addtionalProps: any) => ({
      pluginCoreFn: (props: any) => createrFn(mergeProps(addtionalProps, props)),
      priority: options?.priority
    }),
    options?.name
  )
  // function pluginMiddleware(addtionalProps: any) {
  //   return createPlugin((props) => createrFn(mergeProps(addtionalProps, props)), options)
  // }
  // pluginMiddleware.pluginCoreFn = (props: any) => createrFn(props)
  // pluginMiddleware.priority = options?.priority

  // return pluginMiddleware
}

export function sortPluginByPriority(deepPluginList: MayDeepArray<Plugin<any>>) {
  const plugins = flapDeep(deepPluginList)
  if (plugins.length <= 1) return plugins
  if (plugins.every((p) => !p.priority)) return plugins

  return [...plugins].sort(({ priority: priorityA }, { priority: priorityB }) => (priorityB ?? 0) - (priorityA ?? 0))
}
