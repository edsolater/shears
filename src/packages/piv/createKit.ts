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
  sortPluginByPriority
} from './propHandlers/plugin'
import { handleShadowProps } from './propHandlers/shadowProps'
import { CRef, PivProps } from './types/piv'
import { HTMLTag, ValidController, ValidProps } from './types/tools'
import { AddDefaultPivProps, addDefaultPivProps } from './utils/addDefaultProps'

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
  ? AccessifyProps<Omit<RawProps, 'children'>, Controller> & Pick<RawProps, 'children'>
  : AccessifyProps<RawProps, Controller>) &
  Omit<PivProps<TagName, Controller>, keyof RawProps | 'plugin' | 'shadowProps'> &
  Omit<GetPluginProps<Plugins>, keyof RawProps | 'plugin' | 'shadowProps'> &
  Omit<
    {
      plugin?: MayArray<Plugin<any /* too difficult to type */>>
      shadowProps?: MayArray<Partial<AccessifyProps<RawProps, Controller>>> // component must merged before `<Div>`
      // -------- additional --------
      // auto inject controller to it
      controllerRef?: CRef<Controller>
    },
    keyof RawProps
  >

/** just a shortcut of KitProps
 * @deprecated use BaseKit instead
 */
export type KitProps<
  RawProps extends ValidProps,
  O extends {
    /** will auto-add props: */
    controller?: ValidController
    plugin?: MayArray<Plugin<any>>
    htmlPropsTagName?: keyof HTMLElementTagNameMap
    // /** default is false, only set when children must be function  */
    noNeedAccessifyChildren?: boolean
  } = {}
> = KitPropsInstance<
  RawProps,
  NonNullable<O['controller']>,
  NonNullable<O['plugin']>,
  NonNullable<O['htmlPropsTagName']>,
  NonNullable<O['noNeedAccessifyChildren']>
>

export type UIKit<
  O extends {
    /** will auto-add props: */
    controller?: ValidController
    plugin?: MayArray<Plugin<any>>
    htmlPropsTagName?: keyof HTMLElementTagNameMap
    // /** default is false, only set when children must be function  */
    noNeedAccessifyChildren?: boolean
  } = {}
> = KitPropsInstance<
  {},
  NonNullable<O['controller']>,
  NonNullable<O['plugin']>,
  NonNullable<O['htmlPropsTagName']>,
  NonNullable<O['noNeedAccessifyChildren']>
>

export type KitPropsOptions<
  KitProps extends ValidProps,
  Controller extends ValidController = {},
  DefaultProps extends Partial<KitProps> = {}
> = {
  name?: string
  controller?: (
    props: ParsedKitProps<KitProps>
  ) => any /* use any to avoid this type check (type check means type infer) */
  defaultProps?: DefaultProps
  plugin?: MayArray<Plugin<any>>
  /** default is false */
  noNeedDeAccessifyChildren?: boolean
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
  Controller extends ValidController = {},
  DefaultProps extends Partial<RawProps> = {}
>(
  // too difficult to type here
  props: any,
  options?: KitPropsOptions<RawProps, Controller, DefaultProps>
): ParsedKitProps<AddDefaultPivProps<RawProps, DefaultProps>> & Omit<PivProps<HTMLTag, Controller>, keyof RawProps> {
  const proxyController = options?.controller
    ? toProxifyController<Controller>(() => options.controller!(mergedGettersProps))
    : {}

  const defaultedProps = options?.defaultProps ? addDefaultPivProps(props, options.defaultProps) : props
  // merge kit props
  const mergedGettersProps = pipe(
    defaultedProps,
    (props) =>
      useAccessifiedProps(props, proxyController, options?.noNeedDeAccessifyChildren ? ['children'] : undefined),
    // inject controller
    (props) => (proxyController ? mergeProps(props, { inputController: proxyController } as PivProps) : props),
    // parse plugin of **options**
    (props) =>
      hasProperty(options, 'plugin')
        ? mergePluginReturnedProps({ plugins: sortPluginByPriority(options!.plugin!), props })
        : props, // defined-time
    (props) => mergeProps(props, hasProperty(options, 'name') ? { class: options!.name } : {}), // defined-time
    handleShadowProps, // outside-props-run-time // TODO: assume can't be promisify
    handlePluginProps // outside-props-run-time // TODO: assume can't be promisify
  ) as any /* too difficult to type */

  // load controller
  if (options?.controller) loadPropsControllerRef(mergedGettersProps, proxyController)

  registerControllerInCreateKit(proxyController, props.id)

  return mergedGettersProps
}

export type GetDeAccessifiedProps<K extends ValidProps> = DeAccessifyProps<K>
/**
 * **core function**
 *
 * return multi; not just props
 */
export function useKitProps<
  P extends ValidProps,
  Controller extends ValidController = {},
  DefaultProps extends Partial<GetDeAccessifiedProps<P>> = {}
>(
  props: P,
  options?: KitPropsOptions<GetDeAccessifiedProps<P>, Controller, DefaultProps>
): {
  props: ParsedKitProps<AddDefaultPivProps<GetDeAccessifiedProps<P>, DefaultProps>> &
    Omit<PivProps<HTMLTag, Controller>, keyof GetDeAccessifiedProps<P>>
  lazyLoadController(controller: Controller | ((props: ParsedKitProps<GetDeAccessifiedProps<P>>) => Controller)): void
} {
  type RawProps = GetDeAccessifiedProps<P>
  const { loadController, getControllerCreator } = composeController<RawProps, Controller>()
  const composedProps = getParsedKitProps(props, {
    controller: (props: ParsedKitProps<RawProps>) => getControllerCreator(props),
    ...options
  }) as any /* too difficult to type, no need to check */
  return { props: composedProps, lazyLoadController: loadController }
}

/**
 * section 2: load controller
 */
function composeController<RawProps extends ValidProps, Controller extends ValidController>() {
  const controllerFaker = new Faker<(props: ParsedKitProps<RawProps>) => Controller>()
  const loadController = (inputController: Controller | ((props: ParsedKitProps<RawProps>) => Controller)) => {
    const controllerCreator = typeof inputController === 'function' ? inputController : () => inputController
    controllerFaker.load(controllerCreator)
  }
  return { loadController, getControllerCreator: (props: ParsedKitProps<RawProps>) => controllerFaker.spawn()(props) }
}
