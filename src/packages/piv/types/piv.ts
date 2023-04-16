import { MayArray } from '@edsolater/fnkit'
import { JSX, JSXElement } from 'solid-js'
import { ClassName } from '../propHandlers/classname'
import { HTMLProps } from '../propHandlers/htmlProps'
import { ICSS } from '../propHandlers/icss'
import { IStyle } from '../propHandlers/istyle'
import { Plugin } from '../propHandlers/plugin'
import { ControlledChild, HTMLTag, RawChild, ValidController } from './tools'

export interface PivProps<TagName extends HTMLTag = HTMLTag, Controller extends ValidController = any> {
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
  ) => void // for accessifyProps, onClick can't be array

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
  htmlProps?: HTMLProps<TagName, Controller>

  children?: RawChild | ControlledChild<Controller>

  /** high priority */
  shadowProps?: MayArray<any /* too difficult to type */>

  // /** low priority */
  // outsideProps?: MayArray<any /* too difficult to type */>

  /** special: every kit baseon <Piv> should support this prop */
  plugin?: MayArray<Plugin<any>>

  // -------- special prop --------

  /** only passed in parent component */
  inputController?: Controller

  /**
   * change outter wrapper element
   */
  dangerousRenderWrapperNode?: MayArray<DangerousWrapperNodeFn>
}

export type DangerousWrapperNodeFn = (node: JSXElement) => JSXElement // change outter wrapper element

export type CRef<T> = (el: T) => void // not right
