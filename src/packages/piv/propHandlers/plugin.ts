import { AnyObj, flapDeep, isFunction, MayDeepArray, overwriteFunctionName, shakeNil } from '@edsolater/fnkit'
import { JSX } from 'solid-js'
import { KitProps } from '../createKit'
import { PivProps } from '../types/piv'
import { ValidController, ValidProps } from '../types/tools'
import { mergeProps } from '../utils/mergeProps'
import { omit } from '../utils/omit'

export type GetPluginCreatorParams<T> = T extends PluginCreator<infer Px1>
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

export type PluginCreator<PluginParams extends Record<string, any>> = (params?: PluginParams) => Plugin<any>
export type Plugin<T extends ValidProps = ValidProps, C extends ValidController = {}> =
  | {
      pluginCoreFn?: (props: T) => Partial<KitProps<T, C>> // TODO: should support 'plugin' and 'shadowProps' too
      priority?: number
    }
  | ((props: T) => Partial<KitProps<T, C>> | undefined) // TODO: should support 'plugin' and 'shadowProps' for easier compose
// TODO2: not accessify yet

export function handlePluginProps<P extends AnyObj>(props: P) {
  if (!props?.plugin) return props
  return omit(mergePluginReturnedProps({ plugins: props.plugin, props }), 'plugin')
}

function invokePlugin(plugin: Plugin<any>, props: KitProps<any>) {
  return isFunction(plugin) ? plugin(props) : plugin.pluginCoreFn?.(props)
}

/**
 * merge additional props from plugin
 */
export function mergePluginReturnedProps<T extends AnyObj>({
  plugins,
  props,
}: {
  plugins: MayDeepArray<Plugin<T> | undefined>
  props: T & PivProps
}): T & PivProps {
  return plugins
    ? shakeNil(flapDeep(plugins)).reduce((acc, plugin) => {
        console.log('plugin: ', plugin)
        const pluginProps = invokePlugin(plugin, acc)
        return pluginProps ? mergeProps(acc, pluginProps) : acc
      }, props)
    : props
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
export function createPluginCreator<Params extends AnyObj, Props extends ValidProps = ValidProps>(
  createrFn: (params: Params) => (props: Props) => Partial<Props>, // return a function , in this function can exist hooks
  options?: {
    priority?: number // NOTE -1:  it should be render after final prop has determine
    name?: string
  },
): PluginCreator<Params> {
  const factory = (params: Params) => ({
    pluginCoreFn: createrFn(params),
    priority: options?.priority,
  })
  // @ts-expect-error no need to check
  return options?.name ? overwriteFunctionName(factory, options.name) : factory
}

export function sortPluginByPriority(deepPluginList?: MayDeepArray<Plugin<any>>) {
  const plugins = shakeNil(flapDeep(deepPluginList))
  if (plugins.length <= 1) return plugins
  if (plugins.every((p) => isFunction(p) || !p.priority)) return plugins

  return [...plugins].sort((pluginA, pluginB) => {
    const priorityA = isFunction(pluginA) ? 0 : pluginA.priority
    const priorityB = isFunction(pluginB) ? 0 : pluginB.priority
    return (priorityB ?? 0) - (priorityA ?? 0)
  })
}
