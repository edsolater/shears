import { AddDefaultProperties, flap, flapDeep, hasProperty, MayArray, MayDeepArray, pipe } from '@edsolater/fnkit'
import { mergeProps } from 'solid-js'
import { CRef, PivProps } from './types/piv'
import { ExtendsProps, SignalizeProps, ValidProps, ValidStatus } from './types/tools'
import { gettersProps } from './utils/prop-builders/gettersProps'
import { signalize } from './utils/prop-builders/signalize'
import { GetPluginProps, handlePluginProps, mergePluginReturnedProps, Plugin } from './utils/prop-handlers/plugin'
import { handleShadowProps } from './utils/prop-handlers/shallowProps'

/**
 * - auto add `plugin` `shadowProps` `_promisePropsConfig` `controller` props
 * - auto add Div's props
 * - auto pick plugin prop if specified plugin
 */
type KitPropsCore<
  Props extends ValidProps,
  Status extends ValidStatus,
  Plugins extends MayDeepArray<Plugin<any>>,
  TagName extends keyof HTMLElementTagNameMap = 'div'
> = Props &
  Omit<PivProps<TagName>, keyof Props | 'plugin' | 'shadowProps'> &
  Omit<GetPluginProps<Plugins>, keyof Props | 'plugin' | 'shadowProps'> &
  Omit<
    {
      plugin?: MayArray<Plugin<any /* too difficult to type */>>
      shadowProps?: MayArray<Partial<Props>> // component must merged before `<Div>`
      forceStatus?: ValidStatus
      // -------- additional --------
      // auto inject status to it
      componentStatusRef?: CRef<Status>
    },
    keyof Props
  >

/** just a shortcut of KitProps */
export type KitProps<
  P extends ValidProps,
  O extends {
    extendsProp?: ValidProps
    status?: ValidStatus
    plugin?: MayArray<Plugin<any>>
    htmlPropsTagName?: keyof HTMLElementTagNameMap
  } = {}
> = KitPropsCore<
  ExtendsProps<P, NonNullable<O['extendsProp']>>,
  NonNullable<O['status']>,
  NonNullable<O['plugin']>,
  NonNullable<unknown extends O['htmlPropsTagName'] ? 'div' : O['htmlPropsTagName']>
>
export type CreateKitOptions<T, Status extends ValidStatus = {}, DefaultProps extends Partial<T> = {}> = {
  name?: string
  initStatus?: Status
  defaultProps?: DefaultProps
  plugin?: MayArray<Plugin<any>>
}

export function useKitProps<
  GetterProps extends ValidProps,
  Status extends ValidStatus = {},
  DefaultProps extends Partial<GetterProps> = {}
>(
  props: GetterProps,
  options?: CreateKitOptions<GetterProps, Status, DefaultProps>
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
