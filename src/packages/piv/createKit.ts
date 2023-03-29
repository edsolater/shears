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
type KitPropsInstance<
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
    /** will auto-add props: */
    controllerRef?: ValidController
    plugin?: MayArray<Plugin<any>>
    htmlPropsTagName?: keyof HTMLElementTagNameMap
  } = {}
> = KitPropsInstance<
  ExtendsProps<P, NonNullable<O['extendsProp']>>,
  NonNullable<O['controllerRef']>,
  NonNullable<O['plugin']>,
  NonNullable<unknown extends O['htmlPropsTagName'] ? 'div' : O['htmlPropsTagName']>
>
export type CreateKitOptions<T, Controller extends ValidController = () => {}, DefaultProps extends Partial<T> = {}> = {
  name?: string
  initController?: Controller
  defaultProps?: DefaultProps
  plugin?: MayArray<Plugin<any>>
}

export function useKitProps<
  KitProps extends ValidProps,
  Controller extends ValidController = () => {},
  DefaultProps extends Partial<KitProps> = {}
>(
  props: KitProps,
  options?: CreateKitOptions<KitProps, Controller, DefaultProps>
): Omit<AddDefaultProperties<KitProps, DefaultProps>, 'plugin' | 'shadowProps'> {
  const mergedGettersProps = pipe(
    props,
    (props) => {
      const pluginMergedProps = mergePluginReturnedProps({
        plugin: hasProperty(options, 'plugin') ? sortPluginByPriority(options!.plugin!) : undefined,
        props
      })
      return pluginMergedProps
    }, // defined-time
    (props) =>
      mergeProps(
        ...flap(options?.defaultProps ?? {}),
        props,
        hasProperty(options, 'name') ? { class: options!.name } : {}
      ), // defined-time
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
