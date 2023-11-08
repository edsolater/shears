import { hasProperty, MayArray, MayDeepArray, mergeObjects, pipe } from '@edsolater/fnkit'
import { AccessifyProps, DeAccessifyProps, getUIKitTheme, hasUIKitTheme, useAccessifiedProps } from '.'
import { runtimeObjectFromAccess, LazyLoadObj } from '../fnkit'
import { createUUID, UUID } from './hooks/utils/createUUID'
import { getControllerObjFromControllerContext } from './piv/ControllerContext'
import { registerControllerInCreateKit } from './piv/hooks/useComponentController'
import { CRef, PivProps } from './piv/Piv'
import { getPropsFromPropContextContext } from './piv/PropContext'
import { loadPropsControllerRef } from './piv/propHandlers/children'
import { handlePluginProps } from './piv/propHandlers/handlePluginProps'
import { handleMergifyOnCallbackProps, MergifyProps } from './piv/propHandlers/mergifyProps'
import { GetPluginParams, Plugin } from './piv/propHandlers/plugin'
import { handleShadowProps } from './piv/propHandlers/shadowProps'
import { HTMLTag, ValidController, ValidProps } from './piv/typeTools'
import { mergeProps } from './piv/utils'
import { AddDefaultPivProps, addDefaultPivProps } from './piv/utils/addDefaultProps'
import { omit } from './piv/utils/omit'
import { getPropsFromAddPropContext } from './piv/AddProps'
import { get, hasValue } from '../../app/utils/dataTransmit/getItems'

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
  Omit<GetPluginParams<Plugins>, keyof RawProps | 'plugin' | 'shadowProps'> &
  Omit<
    {
      plugin?: PivProps['plugin']
      shadowProps?: PivProps['shadowProps'] // component must merged before `<Div>`
      // shadowProps?: MayArray<KitPropsInstance<RawProps, Controller, Plugins, TagName, NeedAccessifyProps> | undefined> // component must merged before `<Div>`
      // -------- additional --------
      // auto inject controller to it
      controllerRef?: CRef<Controller>
      //TODO: name?:string to express ui-info more readable than class?:string
    },
    keyof RawProps
  >

export type KitProps<
  RawProps extends ValidProps = {},
  O extends {
    /** will auto-add props: */
    controller?: ValidController
    plugin?: MayArray<Plugin<any>>
    htmlPropsTagName?: HTMLTag
    // default is auto detect, only set when auto is not ok
    needAccessifyProps?: (keyof RawProps)[]
  } = {},
> = KitPropsInstance<
  MergifyProps<RawProps>,
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
   * detect which props is shadowProps\
   * not selfProps means it's shadowProps\
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
 * parse some special props of component. such as shadowProps, plugin, controller, etc.
 */
function getParsedKitProps<
  RawProps extends ValidProps,
  Controller extends ValidController = ValidController,
  DefaultProps extends Partial<RawProps> = {},
>(
  // too difficult to type here
  rawProps: any,
  options?: KitPropsOptions<RawProps, Controller, DefaultProps>,
): ParsedKitProps<AddDefaultPivProps<RawProps, DefaultProps>> & Omit<PivProps<HTMLTag, Controller>, keyof RawProps> {
  const proxyController = options?.controller
    ? runtimeObjectFromAccess(() => options.controller!(mergedGettersProps))
    : {}

  if (options?.name === 'Button') {
    console.log("getUIKitTheme('Button'): ", getUIKitTheme('Button'))
  }
  // merge kit props
  const mergedGettersProps = pipe(
    rawProps,
    // get defaultProps from uikitTheme
    (props) => (options?.name && hasUIKitTheme(options.name) ? mergeProps(getUIKitTheme(options.name), props) : props),
    // get default props
    (props) => (options?.defaultProps ? addDefaultPivProps(props, options.defaultProps) : props),
    (props) =>
      useAccessifiedProps(
        props,
        proxyController,
        options?.needAccessify ??
          (options?.noNeedDeAccessifyChildren
            ? omitItems(Object.getOwnPropertyNames(props), ['children'])
            : Object.getOwnPropertyNames(props)),
      ),

    // inject controller (📝!!!important notice, for lazyLoadController props:innerController will always be a prop of any component useKitProps)
    (props) => mergeProps(props, { innerController: proxyController } as PivProps),
    (props) => handleShadowProps(props, options?.selfProps), // outside-props-run-time // TODO: assume can't be promisify
    (props) => handleMergifyOnCallbackProps(props),
    // parse plugin of **options**
    (props) =>
      handlePluginProps(
        props,
        () => options?.plugin,
        () => hasProperty(options, 'plugin'),
      ), // defined-time
    (props) => (hasProperty(options, 'name') ? mergeProps(props, { class: options!.name }) : props), // defined-time
    (props) => handleShadowProps(props, options?.selfProps), // outside-props-run-time // TODO: assume can't be promisify
    (props) => handlePluginProps(props), // outside-props-run-time // TODO: assume can't be promisify  //<-- bug is HERE!!, after this, class is doubled
  ) as any /* too difficult to type */

  // load controller
  if (options?.controller) loadPropsControllerRef(mergedGettersProps, proxyController)

  registerControllerInCreateKit(proxyController, rawProps.id)

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
// TODO: should has controllerContext to accept controllers
export function useKitProps<
  P extends ValidProps,
  Controller extends ValidController = ValidController,
  DefaultProps extends Partial<GetDeAccessifiedProps<P>> = {},
>(
  kitProps: P,
  options?: KitPropsOptions<GetDeAccessifiedProps<P>, Controller, DefaultProps>,
): {
  /** not declared self props means it's shadowProps */
  shadowProps: any
  props: DeKitProps<P, Controller, DefaultProps>
  lazyLoadController(controller: Controller | ((props: ParsedKitProps<GetDeAccessifiedProps<P>>) => Controller)): void
  contextController: any // no need to infer this type for you always force it !!!
  // TODO: imply it !!! For complicated DOM API always need this, this is a fast shortcut
  // componentRef
} {
  type RawProps = GetDeAccessifiedProps<P>

  // handle ControllerContext
  // wrap controllerContext based on props:innerController is only in `<Piv>`
  const mergedContextController = runtimeObjectFromAccess(getControllerObjFromControllerContext)

  // handle PropContext
  const contextProps = getPropsFromPropContextContext({ componentName: options?.name ?? '' })
  const addPropsContextProps = getPropsFromAddPropContext({ componentName: options?.name ?? '' })
  const propContextParsedProps = mergeProps(kitProps, contextProps, addPropsContextProps)

  // if (propContextParsedProps.children === 'PropContext can pass to deep nested components') {
  //   console.log('kitProps raw: ', { ...propContextParsedProps })
  // }
  const { loadController, getControllerCreator } = createComponentController<RawProps, Controller>()
  const composedProps = getParsedKitProps(
    propContextParsedProps,
    mergeObjects({ controller: (props: ParsedKitProps<RawProps>) => getControllerCreator(props) }, options),
  ) as any /* too difficult to type, no need to check */
  const shadowProps = options?.selfProps ? omit(composedProps, options.selfProps) : composedProps
  return {
    props: composedProps,
    shadowProps,
    lazyLoadController: loadController,
    contextController: mergedContextController,
  }
}

/**
 * section 2: load controller
 */
function createComponentController<RawProps extends ValidProps, Controller extends ValidController | unknown>() {
  const controllerFaker = new LazyLoadObj<(props: ParsedKitProps<RawProps>) => Controller>()
  const loadController = (inputController: Controller | ((props: ParsedKitProps<RawProps>) => Controller)) => {
    const controllerCreator = typeof inputController === 'function' ? inputController : () => inputController
    //@ts-expect-error unknown ?
    controllerFaker.load(controllerCreator)
  }
  return {
    loadController,
    getControllerCreator: (props: ParsedKitProps<RawProps>) =>
      controllerFaker.hasLoaded()
        ? controllerFaker.spawn()(props)
        : {
            /* if don't invoke lazyLoadController, use this default empty  */
          },
  }
}

export type DeKitProps<
  P extends ValidProps,
  Controller extends ValidController = ValidController,
  DefaultProps extends Partial<GetDeAccessifiedProps<P>> = {},
> = ParsedKitProps<AddDefaultPivProps<GetDeAccessifiedProps<P>, DefaultProps>> &
  Omit<PivProps<HTMLTag, Controller>, keyof GetDeAccessifiedProps<P>>

/**
 * generate id so component which can pass to triggerController()
 * inside same component even call multi-time will return same id
 */
function getComponentID(): { getUUID(): UUID } {
  let componentId: UUID | undefined = undefined
  const getUUID = () => {
    if (!componentId) {
      componentId = createUUID().id
    }
    return componentId
  }
  return { getUUID }
}
