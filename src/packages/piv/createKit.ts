import { AddDefaultProperties, flap, flapDeep, hasProperty, MayArray, MayDeepArray, pipe } from '@edsolater/fnkit'
import { mergeProps } from 'solid-js'
import { GetPluginProps, handlePluginProps, mergePluginReturnedProps, Plugin } from './plugin'
import { CRef, PivProps } from './types/piv'
import { ExtendsProps, ValidProps, ValidController } from './types/tools'
import { handleShadowProps } from './utils/prop-handlers/shallowProps'

/**
 * - auto add `plugin` `shadowProps` `_promisePropsConfig` `controller` props
 * - auto add Div's props
 * - auto pick plugin prop if specified plugin
 */
type KitPropsCore<
  Props extends ValidProps,
  Controller extends ValidController,
  Plugins extends MayDeepArray<Plugin<any>>,
  TagName extends keyof HTMLElementTagNameMap = 'div'
> = Props &
  Omit<PivProps<TagName>, keyof Props | 'plugin' | 'shadowProps'> &
  Omit<GetPluginProps<Plugins>, keyof Props | 'plugin' | 'shadowProps'> &
  Omit<
    {
      plugin?: MayArray<Plugin<any /* too difficult to type */>>
      shadowProps?: MayArray<Partial<Props>> // component must merged before `<Div>`
      forceController?: ValidController
      // -------- additional --------
      // auto inject controller to it
      controllerRef?: CRef<Controller>
    },
    keyof Props
  >

/** just a shortcut of KitProps */
export type KitProps<
  P extends ValidProps,
  O extends {
    extendsProp?: ValidProps
    controller?: ValidController
    plugin?: MayArray<Plugin<any>>
    htmlPropsTagName?: keyof HTMLElementTagNameMap
  } = {}
> = KitPropsCore<
  ExtendsProps<P, NonNullable<O['extendsProp']>>,
  NonNullable<O['controller']>,
  NonNullable<O['plugin']>,
  NonNullable<unknown extends O['htmlPropsTagName'] ? 'div' : O['htmlPropsTagName']>
>
export type CreateKitOptions<T, Controller extends ValidController = {}, DefaultProps extends Partial<T> = {}> = {
  name?: string
  initController?: Controller
  defaultProps?: DefaultProps
  plugin?: MayArray<Plugin<any>>
}

export function useKitProps<
  GetterProps extends ValidProps,
  Controller extends ValidController = {},
  DefaultProps extends Partial<GetterProps> = {}
>(
  props: GetterProps,
  options?: CreateKitOptions<GetterProps, Controller, DefaultProps>
): Omit<AddDefaultProperties<GetterProps, DefaultProps>, 'plugin' | 'shadowProps'> {
  const mergedGettersProps = pipe(
    props,
    (props) =>
      mergePluginReturnedProps({
        plugin: hasProperty(options, 'plugin') ? sortPluginByPriority(options!.plugin!) : undefined,
        props
      }), // defined-time
    (props) => mergeProps(...flap(options?.defaultProps ?? {}), props, { className: options?.name }), // defined-time
    handleShadowProps, // outside-props-run-time
    handlePluginProps // outside-props-run-time
  )
  return mergedGettersProps as any
}

function sortPluginByPriority(deepPluginList: MayDeepArray<Plugin<any>>) {
  const plugins = flapDeep(deepPluginList)
  if (plugins.length <= 1) return plugins
  if (plugins.every((p) => !p.priority)) return plugins

  return [...plugins].sort(({ priority: priorityA }, { priority: priorityB }) => (priorityB ?? 0) - (priorityA ?? 0))
}
