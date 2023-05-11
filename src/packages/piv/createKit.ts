import { hasProperty, MayArray, MayDeepArray, pipe } from '@edsolater/fnkit'
import { createEffect, mergeProps, onCleanup } from 'solid-js'
import { Accessify, useAccessifiedProps } from '../pivkit/utils/accessifyProps'
import {
  loadPropsControllerRef,
  toProxifyController} from './propHandlers/controller'
import { recordController, unregisterController } from "./hooks/useComponentController"
import {
  GetPluginProps,
  handlePluginProps,
  mergePluginReturnedProps,
  Plugin,
  sortPluginByPriority
} from './propHandlers/plugin'
import { handleShadowProps } from './propHandlers/shadowProps'
import { CRef, PivProps } from './types/piv'
import { HTMLTag, ValidController, ValidProps } from './types/tools'

/**
 * - auto add `plugin` `shadowProps` `_promisePropsConfig` `controller` props
 * - auto add Div's props
 * - auto pick plugin prop if specified plugin
 * @todo also promisify?
 */
type KitPropsInstance<
  RawProps extends ValidProps,
  Controller extends ValidController,
  Plugins extends MayDeepArray<Plugin<any>>,
  TagName extends keyof HTMLElementTagNameMap,
  NoNeedAccessifyChildren extends boolean
> = (NoNeedAccessifyChildren extends true
  ? Accessify<Omit<RawProps, 'children'>, Controller> & Pick<RawProps, 'children'>
  : Accessify<RawProps, Controller>) &
  Omit<PivProps<TagName, Controller>, keyof RawProps | 'plugin' | 'shadowProps'> &
  Omit<GetPluginProps<Plugins>, keyof RawProps | 'plugin' | 'shadowProps'> &
  Omit<
    {
      /**
       * id for component instance
       * so others can access component's controller without set `props:controllerRef` to component, this have to have access to certain component instance
       */
      id?: string
      plugin?: MayArray<Plugin<any /* too difficult to type */>>
      shadowProps?: MayArray<Partial<Accessify<RawProps, Controller>>> // component must merged before `<Div>`
      // -------- additional --------
      // auto inject controller to it
      controllerRef?: CRef<Controller>
    },
    keyof RawProps
  >

/** just a shortcut of KitProps */
export type KitProps<
  RawProps extends ValidProps,
  O extends {
    /** will auto-add props: */
    controller?: ValidController
    plugin?: MayArray<Plugin<any>>
    htmlPropsTagName?: keyof HTMLElementTagNameMap
    // /** default is false */
    noNeedAccessifyChildren?: boolean
  } = {}
> = KitPropsInstance<
  RawProps,
  NonNullable<O['controller']>,
  NonNullable<O['plugin']>,
  NonNullable<O['htmlPropsTagName']>,
  NonNullable<O['noNeedAccessifyChildren']>
>
export type KitPropsOptions<
  KitProps extends ValidProps,
  Controller extends ValidController = {}
  // DefaultProps extends Partial<KitProps> = {}
> = {
  name?: string
  controller?: (
    props: ParsedKitProps<KitProps>
  ) => any /* use any to avoid this type check (type check means type infer) */
  // defaultProps?: DefaultProps
  plugin?: MayArray<Plugin<any>>
  /** default is false */
  noNeedAccessifyChildren?: boolean
}

/** return type of useKitProps */
export type ParsedKitProps<RawProps extends ValidProps> = Omit<RawProps, 'plugin' | 'shadowProps'>

// /** to RawProps */
// export type DeKitProps<Props extends ValidProps> = Props extends KitPropsInstance<infer RawProps, any, any, any, any>
//   ? RawProps
//   : Props

export function useKitProps<RawProps extends ValidProps, Controller extends ValidController = {}>(
  // too difficult to type here
  props: any,
  options?: KitPropsOptions<RawProps, Controller>
): ParsedKitProps<RawProps> & Omit<PivProps<HTMLTag, Controller>, keyof RawProps> {
  const proxyController = options?.controller
    ? toProxifyController<Controller>(() => options.controller!(mergedGettersProps))
    : {}
  // merge kit props
  const mergedGettersProps = pipe(
    props,
    (props) => useAccessifiedProps(props, proxyController, options?.noNeedAccessifyChildren ? ['children'] : undefined),
    // inject controller
    (props) => (proxyController ? mergeProps(props, { inputController: proxyController } as PivProps) : props),
    // parse plugin of **options**
    (props) => {
      if (hasProperty(options, 'plugin')) {
        return mergePluginReturnedProps({
          plugins: sortPluginByPriority(options!.plugin!),
          props
        })
      } else {
        return props
      }
    }, // defined-time
    (props) =>
      mergeProps(
        props,
        hasProperty(options, 'name') ? { class: options!.name } : {},
        hasProperty(props, 'id') ? { id: props.id } : {}
      ), // defined-time
    handleShadowProps, // outside-props-run-time // TODO: assume can't be promisify
    handlePluginProps // outside-props-run-time // TODO: assume can't be promisify
  ) as any /* too difficult to type */

  // load controller
  if (options?.controller) {
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
