import { flap, omit } from '@edsolater/fnkit'
import { JSXElement, createComponent } from 'solid-js'
import { Dynamic } from 'solid-js/web'
import { parsePivProps } from './propHandlers/parsePivProps'
import { PivProps } from './types/piv'

export const pivPropsNames = [
  'as',
  'children',
  'class',
  'dangerousRenderWrapperNode',
  'htmlProps',
  'icss',
  'onClick',
  'plugin',
  'domRef',
  'shadowProps',
  'style',
  'debugLog',
  'inputController',
  'id'
] satisfies (keyof PivProps<any>)[]

export const Piv = <TagName extends keyof HTMLElementTagNameMap = keyof HTMLElementTagNameMap>(
  props: PivProps<TagName>
) => {
  // const props = pipe(rawProps as Partial<PivProps>, handleShadowProps, handlePluginProps)
  // if (!props) return null // just for type, logicly it will never happen

  // handle have return null
  return 'dangerousRenderWrapperNode' in props
    ? handleDangerousWrapperPluginsWithChildren(props)
    : handleNormalPivProps(props)
}

function handleNormalPivProps(props: Omit<PivProps<any>, 'plugin' | 'shadowProps'>) {
  const parsedPivProps = parsePivProps(props)
  return 'as' in props ? <Dynamic component={props.as} {...parsedPivProps} /> : <div {...parsedPivProps} />
}

function handleDangerousWrapperPluginsWithChildren(props: PivProps<any>): JSXElement {
  return flap(props.dangerousRenderWrapperNode).reduce(
    (prevNode, getWrappedNode) => (getWrappedNode ? getWrappedNode(prevNode) : prevNode),
    createComponent(props.as ?? Piv, omit(props, 'dangerousRenderWrapperNode'))
  )
}

