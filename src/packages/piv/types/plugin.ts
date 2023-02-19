import { JSXElement } from 'solid-js'
import { PivProps } from './piv'

export type WrapperNodeFn = (node: JSXElement) => JSXElement // change outter wrapper element

export type PluginCreateFn<T> = (props: T) => Partial<Omit<PivProps, 'plugin' | 'shadowProps'>>

export type PivPlugin<T> = {
  (additionalProps: Partial<T & PivProps>): PivPlugin<T>
  getProps?: (props: T & PivProps) => Partial<Omit<PivProps, 'plugin' | 'shadowProps'>>
  priority?: number // NOTE -1:  it should be calculated after final prop has determine
}

export type PivShadowProps<OriginalProps> = Partial<Omit<OriginalProps, 'as'>>