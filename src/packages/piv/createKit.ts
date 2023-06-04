import { hasProperty, MayArray, MayDeepArray, pipe } from '@edsolater/fnkit'
import { mergeProps } from 'solid-js'
import { Faker } from '../fnkit/customizedClasses/Faker'
import { AccessifyProps, DeAccessifyProps, useAccessifiedProps } from '../pivkit/utils/accessifyProps'
import { registerControllerInCreateKit } from './hooks/useComponentController'
import { loadPropsControllerRef, toProxifyController } from './propHandlers/controller'
import {
  GetPluginProps,
  handlePluginProps,
  mergePluginReturnedProps,
  Plugin,
  sortPluginByPriority,
} from './propHandlers/plugin'
import { handleShadowProps } from './propHandlers/shadowProps'
import { CRef, PivProps } from './types/piv'
import { HTMLTag, ValidController, ValidProps } from './types/tools'
import { AddDefaultPivProps, addDefaultPivProps } from './utils/addDefaultProps'
import { omit } from './utils/omit'

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
  TagName extends HTMLTag,
  NeedAccessifyProps extends keyof RawProps,
> = AccessifyProps<Pick<RawProps, NeedAccessifyProps>, Controller> &
  Omit<RawProps, NeedAccessifyProps> &
  Omit<PivProps<TagName, Controller>, keyof RawProps | 'plugin' | 'shadowProps'> &
  Omit<GetPluginProps<Plugins>, keyof RawProps | 'plugin' | 'shadowProps'> &
  Omit<
    {
      plugin?: MayArray<Plugin<any /* too difficult to type */>>
      shadowProps?: RawProps // component must merged before `<Div>`
      // -------- additional --------
      // auto inject controller to it
      controllerRef?: CRef<Controller>
    },
    keyof RawProps
  >

/**
 *  just a shortcut of KitProps
 */
export type KitProps<
  RawProps extends ValidProps,
  O extends {
    /** will auto-add props: */
    controller?: ValidController
    plugin?: MayArray<Plugin<any>>
    htmlPropsTagName?: HTMLTag
    // default is auto detect, only set when auto is not ok
    needAccessifyProps?: (keyof RawProps)[]
  } = {},
> = KitPropsInstance<
  RawProps,
  NonNullable<O['controller']>,
  NonNullable<O['plugin']>,
  NonNullable<O['htmlPropsTagName']>,
  NonNullable<O['needAccessifyProps'] extends string[] ? O['needAccessifyProps'][number] : keyof RawProps>
>

/**
 * @deprecated use `KitProps` instead
 */
export type UIKit<
  O extends {
    componentProps?: ValidProps
    /** will auto-add props: */
    controller?: ValidController
    plugin?: MayArray<Plugin<any>>
    htmlPropsTagName?: HTMLTag
    // /** default is false, only set when children must be function  */
  } = {},
> = KitPropsInstance<
  NonNullable<O['componentProps']>,
  NonNullable<O['controller']>,
  NonNullable<O['plugin']>,
  NonNullable<O['htmlPropsTagName']>,
  keyof NonNullable<O['componentProps']>
>

export type KitPropsOptions<
  KitProps extends ValidProps,
  Controller extends ValidController | unknown = unknown,
  DefaultProps extends Partial<KitProps> = {},
> = {
  name?: string
  controller?: (
    props: ParsedKitProps<KitProps>,
  ) => any /* use any to avoid this type check (type check means type infer) */
  defaultProps?: DefaultProps
  plugin?: MayArray<Plugin<any>>
  /** default is false
   * @deprecated use `needAccessify` instead
   */
  noNeedDeAccessifyChildren?: boolean
  /** by default, all will check to Accessify */
  needAccessify?: string[]
  /**
   * not selfProps means it's shadowProps,
   * by default, all props are shadowProps(which can pass to shadowProps="")
   */
  selfProps?: string[]
}

/** return type of useKitProps */
export type ParsedKitProps<RawProps extends ValidProps> = Omit<RawProps, 'plugin' | 'shadowProps'>

// /** to RawProps */
// export type DeKitProps<Props extends ValidProps> = Props extends KitPropsInstance<infer RawProps, any, any, any, any>
//   ? RawProps
//   : Props

/**
 * section 1: merge props
 */
function getParsedKitProps<
  RawProps extends ValidProps,
  Controller extends ValidController | unknown = unknown,
  DefaultProps extends Partial<RawProps> = {},
>(
  // too difficult to type here
  props: any,
  options?: KitPropsOptions<RawProps, Controller, DefaultProps>,
): ParsedKitProps<AddDefaultPivProps<RawProps, DefaultProps>> & Omit<PivProps<HTMLTag, Controller>, keyof RawProps> {
  const proxyController = options?.controller
    ? toProxifyController<Controller>(() => options.controller!(mergedGettersProps))
    : {}

  const defaultedProps = options?.defaultProps ? addDefaultPivProps(props, options.defaultProps) : props
  // merge kit props
  const mergedGettersProps = pipe(
    defaultedProps,
    (props) =>
      useAccessifiedProps(
        props,
        proxyController,
        options?.needAccessify ??
          (options?.noNeedDeAccessifyChildren ? omitItems(Object.keys(props), ['children']) : Object.keys(props)),
      ),
    // inject controller
    (props) => (proxyController ? mergeProps(props, { innerController: proxyController } as PivProps) : props),
    // parse plugin of **options**
    (props) =>
      hasProperty(options, 'plugin')
        ? mergePluginReturnedProps({ plugins: sortPluginByPriority(options!.plugin!), props })
        : props, // defined-time
    (props) => mergeProps(props, hasProperty(options, 'name') ? { class: options!.name } : {}), // defined-time
    (props) => handleShadowProps(props, options?.selfProps), // outside-props-run-time // TODO: assume can't be promisify
    handlePluginProps, // outside-props-run-time // TODO: assume can't be promisify
  ) as any /* too difficult to type */

  // load controller
  if (options?.controller) loadPropsControllerRef(mergedGettersProps, proxyController)

  registerControllerInCreateKit(proxyController, props.id)

  return mergedGettersProps
}

/**
 * Returns a new array with all elements of the input array except for the specified items.
 * @param arr The input array to filter.
 * @param items The item(s) to omit from the array.
 * @returns A new array with all elements of the input array except for the specified items.
 */
export function omitItems<T>(arr: T[], items: T | T[]): T[] {
  const omitSet = new Set(Array.isArray(items) ? items : [items])
  return arr.filter((item) => !omitSet.has(item))
}

export type GetDeAccessifiedProps<K extends ValidProps> = DeAccessifyProps<K>
/**
 * **core function**
 *
 * return multi; not just props
 */
export function useKitProps<
  P extends ValidProps,
  Controller extends ValidController | unknown = unknown,
  DefaultProps extends Partial<GetDeAccessifiedProps<P>> = {},
>(
  props: P,
  options?: KitPropsOptions<GetDeAccessifiedProps<P>, Controller, DefaultProps>,
): {
  /** not declared self props means it's shadowProps */
  shadowProps: any
  props: DeKitProps<P, Controller, DefaultProps>
  lazyLoadController(controller: Controller | ((props: ParsedKitProps<GetDeAccessifiedProps<P>>) => Controller)): void
} {
  type RawProps = GetDeAccessifiedProps<P>
  const { loadController, getControllerCreator } = composeController<RawProps, Controller>()
  const composedProps = getParsedKitProps(props, {
    controller: (props: ParsedKitProps<RawProps>) => getControllerCreator(props),
    ...options,
  }) as any /* too difficult to type, no need to check */
  const shadowProps = options?.selfProps ? omit(composedProps, options.selfProps) : composedProps
  return { props: composedProps, shadowProps, lazyLoadController: loadController }
}

/**
 * section 2: load controller
 */
function composeController<RawProps extends ValidProps, Controller extends ValidController | unknown>() {
  const controllerFaker = new Faker<(props: ParsedKitProps<RawProps>) => Controller>()
  const loadController = (inputController: Controller | ((props: ParsedKitProps<RawProps>) => Controller)) => {
    const controllerCreator = typeof inputController === 'function' ? inputController : () => inputController
    //@ts-expect-error unknown ?
    controllerFaker.load(controllerCreator)
  }
  return { loadController, getControllerCreator: (props: ParsedKitProps<RawProps>) => controllerFaker.spawn()(props) }
}

export type DeKitProps<
  P extends ValidProps,
  Controller extends ValidController | unknown = unknown,
  DefaultProps extends Partial<GetDeAccessifiedProps<P>> = {},
> = ParsedKitProps<AddDefaultPivProps<GetDeAccessifiedProps<P>, DefaultProps>> &
  Omit<PivProps<HTMLTag, Controller>, keyof GetDeAccessifiedProps<P>>
