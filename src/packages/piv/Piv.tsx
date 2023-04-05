import { flap, omit } from '@edsolater/fnkit'
import { createComponent, JSX, JSXElement } from 'solid-js'
import { Dynamic } from 'solid-js/web'
import { PivProps } from './types/piv'
import { parsePivProps } from './propHandlers/parsePivProps'

export const pivPropsNames = [
  'as',
  'children',
  'class',
  'dangerousRenderWrapperNode',
  'htmlProps',
  'icss',
  'onClick',
  'plugin',
  'ref',
  'shadowProps',
  'style'
] satisfies (keyof PivProps<any>)[]

export const Piv = <TagName extends keyof HTMLElementTagNameMap = keyof HTMLElementTagNameMap>(
  props: PivProps<TagName>
) => {
  // const props = pipe(rawProps as Partial<PivProps>, handleShadowProps, handlePluginProps)
  // if (!props) return null // just for type, logicly it will never happen

  // handle have return null
  return props.dangerousRenderWrapperNode
    ? handleDangerousWrapperPluginsWithChildren(props)
    : handleNormalPivProps(props)
}

function handleNormalPivProps(
  props: Omit<PivProps<any>, 'plugin' | 'shadowProps'> 
) {
  return props.as ? (
    <Dynamic component={props.as} {...parsePivProps(props)} />
  ) : (
    <div {...parsePivProps(props)} />
  )
}

function handleDangerousWrapperPluginsWithChildren(props: PivProps<any>): JSXElement {
  return flap(props.dangerousRenderWrapperNode).reduce(
    (prevNode, getWrappedNode) => (getWrappedNode ? getWrappedNode(prevNode) : prevNode),
    createComponent(props.as ?? Piv, omit(props, 'dangerousRenderWrapperNode'))
  )
}
