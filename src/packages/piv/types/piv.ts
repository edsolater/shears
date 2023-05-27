import { MayArray } from '@edsolater/fnkit'
import { JSX, JSXElement } from 'solid-js'
import { ClassName } from '../propHandlers/classname'
import { HTMLProps } from '../propHandlers/htmlProps'
import { ICSS } from '../propHandlers/icss'
import { IStyle } from '../propHandlers/istyle'
import { Plugin } from '../propHandlers/plugin'
import { ControlledChild, HTMLTag, RawChild, ValidController } from './tools'

export interface PivProps<TagName extends HTMLTag = HTMLTag, Controller extends ValidController | unknown = unknown> {
  /** @example
   * const Button = () => <Piv as={(parsedPivProps) => <button {...parsedPivProps} />} />
   */
  as?: (props: object) => JSX.Element // assume a function return ReactNode is a Component

  debugLog?: (keyof PivProps)[]

  /**
   * auto merge by shadowProps
   */
  domRef?: MayArray<CRef<any> | null | undefined>

  /**
   * auto merge by shadowProps
   * if it's in shadow props, it will merge with exist props
   */
  class?: MayArray<ClassName<Controller>>

  /**
   * id for component instance
   * so others can access component's controller without set `props:controllerRef` to component, this have to have access to certain component instance
   */
  id?: string

  onClick?: (
    utils: {
      ev: MouseEvent & {
        currentTarget: HTMLElementTagNameMap[TagName]
        target: Element
      }
      el: HTMLElementTagNameMap[TagName]
    } & Controller
  ) => void // for accessifyProps, onClick can't be array

  /**
   * auto merge by shadowProps
   * if it's in shadow props, it will merge with exist props
   */
  icss?: ICSS<Controller>

  /**
   * auto merge by shadowProps
   * if it's in shadow props, it will merge with exist props
   */
  style?: IStyle<Controller>

  /**
   * auto merge by shadowProps
   * if it's in shadow props, it will merge with exist props
   */
  htmlProps?: HTMLProps<TagName, Controller>

  children?: ControlledChild<unknown extends Controller ? any : Controller> // any is convient for <Piv>

  /**
   * auto merge by shadowProps
   * high priority
   */
  shadowProps?: MayArray<any /* too difficult to type */>

  // /** low priority */
  // outsideProps?: MayArray<any /* too difficult to type */>

  /**
   * auto merge by shadowProps
   * special: every kit baseon <Piv> should support this prop
   */
  plugin?: MayArray<Plugin<any>>

  // -------- special prop --------

  /** only passed in parent component */
  inputController?: Controller

  /**
   * auto merge by shadowProps
   * change outter wrapper element
   */
  // 'render:outsideWrapper': MayArray<DangerousWrapperNodeFn>
  dangerousRenderWrapperNode?: MayArray<DangerousWrapperNodeFn>

  'render:prepend'?: MayArray<ControlledChild<Controller>>
  'render:append'?: MayArray<ControlledChild<Controller>>
}

export type DangerousWrapperNodeFn = (node: JSXElement) => JSXElement // change outter wrapper element

export type CRef<T> = (el: T) => void // not right

type A = unknown extends unknown ? true : false
