import { MayDeepArray, pipe, flapDeep } from '@edsolater/fnkit'
import { mergeProps } from 'solid-js'
import { CRef, PivProps } from './types/piv'
import { ExtendsProps, ValidProps, ValidStatus } from './types/tools'
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
  TagName extends keyof HTMLElementTagNameMap,
  Plugins extends MayDeepArray<Plugin<any>>
> = Props &
  Omit<PivProps<TagName>, keyof Props | 'plugin' | 'shadowProps'> &
  Omit<GetPluginProps<Plugins>, keyof Props | 'plugin' | 'shadowProps'> &
  Omit<
    {
      plugin?: MayDeepArray<Plugin<any /* too difficult to type */>>
      shadowProps?: MayDeepArray<Partial<Props>> // component must merged before `<Div>`
      defaultStatus?: ValidStatus
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
    htmlPropsTagName?: keyof HTMLElementTagNameMap
    plugin?: MayDeepArray<Plugin<any>>
  } = {}
> = KitPropsCore<
  ExtendsProps<P, NonNullable<O['extendsProp']>>,
  NonNullable<O['status']>,
  NonNullable<O['htmlPropsTagName']>,
  NonNullable<O['plugin']>
>
export type CreateKitOptions<T, Status extends ValidStatus = {}> = {
  name: string
  initStatus?: Status
  defaultProps?: Omit<T, 'children'>
  plugin?: MayDeepArray<Plugin<any>>
}

type WithDivChildren<
  Props extends ValidProps,
  TagName extends keyof HTMLElementTagNameMap = 'div'
> = 'children' extends keyof Props ? Props : Props & Pick<PivProps<TagName>, 'children'>

export function useKitProps<Props extends ValidProps, Status extends ValidStatus = {}>(
  props: Props,
  options?: CreateKitOptions<Props, Status>
): [componentProps: WithDivChildren<Props, 'div'>, pivProps: PivProps] {
  const mergedProps = pipe(
    props,
    (props) =>
      mergePluginReturnedProps({
        plugin: options?.plugin ? sortPluginByPriority(options.plugin) : options?.plugin,
        props
      }), // defined-time
    (props) => mergeProps(options?.defaultProps ?? {}, props, { className: options?.name }), // defined-time
    handleShadowProps, // outside-props-run-time
    handlePluginProps // outside-props-run-time
  ) as any
  return [mergedProps /* <-- FIX THIS TYPE */, mergedProps]
}

function sortPluginByPriority(deepPluginList: MayDeepArray<Plugin<any>>) {
  const plugins = flapDeep(deepPluginList)
  if (plugins.length <= 1) return plugins
  if (plugins.every((p) => !p.priority)) return plugins

  return [...plugins].sort(({ priority: priorityA }, { priority: priorityB }) => (priorityB ?? 0) - (priorityA ?? 0))
}
