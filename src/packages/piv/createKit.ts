import { AddDefaultProperties, flap, flapDeep, hasProperty, MayArray, MayDeepArray, pipe } from '@edsolater/fnkit'
import { mergeProps } from 'solid-js'
import { GetPluginProps, handlePluginProps, mergePluginReturnedProps, Plugin } from './plugin'
import { CRef, PivProps } from './types/piv'
import { ExtendsProps, ValidProps, ValidController } from './types/tools'
import { handleShadowProps } from './utils/propHandlers/shadowProps'

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
    controller?: ValidController
    plugin?: MayArray<Plugin<any>>
    htmlPropsTagName?: keyof HTMLElementTagNameMap
  } = {}
> = KitPropsInstance<
  ExtendsProps<P, NonNullable<O['extendsProp']>>,
  NonNullable<O['controller']>,
  NonNullable<O['plugin']>,
  NonNullable<unknown extends O['htmlPropsTagName'] ? 'div' : O['htmlPropsTagName']>
>
export type KitPropsOptions<
  KitProps extends ValidProps,
  Controller extends ValidController = {},
  DefaultProps extends Partial<KitProps> = {}
> = {
  name?: string
  controller?: (props: ParsedKitProps<KitProps, Controller, DefaultProps>) => Controller
  defaultProps?: DefaultProps
  plugin?: MayArray<Plugin<any>>
}

/** return type of useKitProps */
export type ParsedKitProps<
  KitProps extends ValidProps,
  Controller extends ValidController = {},
  DefaultProps extends Partial<KitProps> = {}
> = Omit<AddDefaultProperties<KitProps, DefaultProps>, 'plugin' | 'shadowProps'>

export function useKitProps<
  KitProps extends ValidProps,
  Controller extends ValidController = {},
  DefaultProps extends Partial<KitProps> = {}
>(
  props: KitProps,
  options?: KitPropsOptions<KitProps, Controller, DefaultProps>
): ParsedKitProps<KitProps, Controller, DefaultProps> {
  // merge kit props
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
  ) as ParsedKitProps<KitProps, Controller, DefaultProps>
  // load controller
  if (options?.controller) {
    loadPropsContollerRef(
      mergedGettersProps,
      toProxifyController<Controller>(() => options.controller!(mergedGettersProps))
    )
  }
  return mergedGettersProps
}

function sortPluginByPriority(deepPluginList: MayDeepArray<Plugin<any>>) {
  const plugins = flapDeep(deepPluginList)
  if (plugins.length <= 1) return plugins
  if (plugins.every((p) => !p.priority)) return plugins

  return [...plugins].sort(({ priority: priorityA }, { priority: priorityB }) => (priorityB ?? 0) - (priorityA ?? 0))
}

function loadPropsContollerRef<Controller extends ValidController>(
  props: Partial<KitProps<{ controllerRef?: (getController: Controller) => void }>>, // FIXME: this type is not same as CRef<>
  providedController: Controller
) {
  if (hasProperty(props, 'controllerRef')) {
    props.controllerRef!(providedController)
  }
}

/** for lazy invoke,  */
function toProxifyController<Controller extends ValidController>(getController: () => Controller): Controller {
  let controller: Controller | undefined = undefined
  return new Proxy(
    {},
    {
      get(target, prop) {
        if (!controller) {
          controller = getController()
        }
        return controller![prop as keyof Controller]
      }
    }
  ) as Controller
}
