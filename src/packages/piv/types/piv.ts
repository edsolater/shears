import { MayArray } from '@edsolater/fnkit'
import { JSX, JSXElement } from 'solid-js'
import { ClassName } from '../propHandlers/classname'
import { ICSS } from '../propHandlers/icss'
import { Plugin } from '../propHandlers/plugin'
import { PivShadowProps } from '../propHandlers/shadowProps'
import { HTMLTag, LoadController, ValidController } from './tools'
import { IStyle } from '../propHandlers/istyle'

export interface PivProps<TagName extends HTMLTag = HTMLTag, Controller extends ValidController = {}> {
  /** @example
   * const Button = () => <Piv as={(parsedPivProps) => <button {...parsedPivProps} />} />
   */
  as?: (props: object) => JSX.Element // assume a function return ReactNode is a Component

  ref?: MayArray<CRef<any> | null | undefined>

  /**
   * if it's in shadow props, it will merge with exist props
   */
  class?: MayArray<ClassName<Controller>>

  onClick?: (
    utils: {
      ev: MouseEvent & {
        currentTarget: HTMLElementTagNameMap[TagName]
        target: Element
      }
      el: HTMLElementTagNameMap[TagName]
    } & Controller
  ) => void

  /**
   * if it's in shadow props, it will merge with exist props
   */
  icss?: ICSS<Controller>

  /**
   * if it's in shadow props, it will merge with exist props
   */
  style?: IStyle<Controller>

  /**
   * if it's in shadow props, it will merge with exist props
   */
  htmlProps?: MayArray<JSX.IntrinsicElements[TagName] | undefined>

  children?: LoadController<JSXElement, Controller>

  /** special: every kit baseon <Piv> should support this prop */
  shadowProps?: MayArray<PivShadowProps<PivProps<any>>>

  /** special: every kit baseon <Piv> should support this prop */
  plugin?: MayArray<Plugin<any>>

  // -------- special prop --------

  /** only passed in parent component */
  transmittedController?: Controller

  /**
   * change outter wrapper element
   */
  dangerousRenderWrapperNode?: MayArray<DangerousWrapperNodeFn>
}

export type DangerousWrapperNodeFn = (node: JSXElement) => JSXElement // change outter wrapper element

export type CRef<T> = (el: T) => void // not right
