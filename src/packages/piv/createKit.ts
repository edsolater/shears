import { AddDefaultProperties, flap, flapDeep, hasProperty, MayArray, MayDeepArray, pipe } from '@edsolater/fnkit'
import { createEffect, mergeProps, onCleanup } from 'solid-js'
import {
  GetPluginProps,
  handlePluginProps,
  mergePluginReturnedProps,
  Plugin,
  sortPluginByPriority
} from './propHandlers/plugin'
import { CRef, PivProps } from './types/piv'
import { ExtendsProps, ValidProps, ValidController } from './types/tools'
import { handleShadowProps } from './propHandlers/shadowProps'
import {
  toProxifyController,
  loadPropsControllerRef,
  recordController,
  unregisterController
} from './propHandlers/controller'

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
      /**
       * id for component instance
       * so others can access component's controller without set `props:controllerRef` to component, this have to have access to certain component instance
       */
      id?: string
      plugin?: MayArray<Plugin<any /* too difficult to type */>>
      shadowProps?: MayArray<Partial<Props>> // component must merged before `<Div>`
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
    const proxyController = toProxifyController<Controller>(() => options.controller!(mergedGettersProps))
    loadPropsControllerRef(mergedGettersProps, proxyController)
    // load id
    const id = props.id
    if (id) {
      createEffect(() => {
        id && recordController(id, proxyController)
        onCleanup(() => {
          unregisterController(id)
        })
      })
    }
  }

  return mergedGettersProps
}
