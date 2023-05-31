import { MayArray } from '@edsolater/fnkit'
import { JSX, JSXElement } from 'solid-js'
import { ClassName } from '../propHandlers/classname'
import { HTMLProps } from '../propHandlers/htmlProps'
import { ICSS } from '../propHandlers/icss'
import { IStyle } from '../propHandlers/istyle'
import { Plugin } from '../propHandlers/plugin'
import { HTMLTag, PivChild, ValidController } from './tools'

export interface PivProps<TagName extends HTMLTag = HTMLTag, Controller extends ValidController | unknown = unknown> {
  /** @example
   * const Button = () => <Piv as={(parsedPivProps) => <button {...parsedPivProps} />} />
   */
  'render:self'?: (selfProps: PivProps<any, any>) => JSX.Element // assume a function return ReactNode is a Component

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
    } & Controller,
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
   *
   * htmlProps can't have controller, because if this props be a function. there is no way to detect which props it will finnaly use
   */
  htmlProps?: HTMLProps<TagName>

  children?: PivChild<unknown extends Controller ? any : Controller> // any is convient for <Piv>

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
  innerController?: Controller

  /**
   * auto merge by shadowProps
   * change outter wrapper element
   */
  'render:nodeWrapper'?: MayArray<DangerousWrapperNodeFn>
  'render:firstChild'?: MayArray<PivChild<Controller>>
  'render:lastChild'?: MayArray<PivChild<Controller>>
}

export type DangerousWrapperNodeFn = (originalChildren: JSXElement) => JSXElement // change outter wrapper element

export type CRef<T> = (el: T) => void // not right
