import { MayArray } from '@edsolater/fnkit'
import { JSX, JSXElement } from 'solid-js'
import { ClassName } from '../utils/classname'
import { ICSS } from '../utils/icss'
import { PivPlugin, PivShadowProps } from './plugin'

export interface PivProps<TagName extends keyof HTMLElementTagNameMap = 'div'> {
  /** @example
   * const Button = () => <Piv as={(parsedPivProps) => <button {...parsedPivProps} />} />
   */
  as?: (props: object) => JSX.Element // assume a function return ReactNode is a Component

  /** it can hold some small logic scripts. only trigger once, if you need update frequently, please use `domRef`*/
  ref?: MayArray<CRef<any> | null | undefined>
  class?: MayArray<ClassName | undefined>
  onClick?: (utils: {
    ev: MouseEvent & {
      currentTarget: HTMLElementTagNameMap[TagName]
      target: Element
    }
    el: HTMLElementTagNameMap[TagName]
  }) => void
  icss?: ICSS
  style?: MayArray<JSX.HTMLAttributes<any>['style'] | undefined>
  htmlProps?: MayArray<JSX.IntrinsicElements[TagName extends {} ? TagName : any] | undefined>
  children?: JSXElement

  /** special: every kit baseon <Piv> should support this prop */
  shadowProps?: MayArray<PivShadowProps<PivProps<any>>>

  /** special: every kit baseon <Piv> should support this prop */
  plugin?: MayArray<PivPlugin<any>>

  /**
   * change outter wrapper element
   */
  dangerousRenderWrapperNode?: MayArray<DangerousWrapperNodeFn>
}

export type DangerousWrapperNodeFn = (node: JSXElement) => JSXElement // change outter wrapper element

export type CRef<T> = (el: T) => void
