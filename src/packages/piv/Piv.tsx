import { flap, omit } from '@edsolater/fnkit'
import { JSXElement, createComponent } from 'solid-js'
import { parsePivProps } from './propHandlers/parsePivProps'
import { PivProps } from './types/piv'
import { HTMLTag, ValidController } from './types/tools'

export const pivPropsNames = [
  'id',
  'domRef',
  'class',
  'htmlProps',
  'icss',
  'onClick',
  'plugin',
  'shadowProps',
  'style',
  'debugLog',

  'innerController',
  'children',

  'render:self',
  'render:outWrapper',
  'render:firstChild',
  'render:lastChild',
] satisfies (keyof PivProps<any>)[]

export const Piv = <TagName extends HTMLTag = HTMLTag, Controller extends ValidController | unknown = unknown>(
  props: PivProps<TagName, Controller>,
) => {
  // const props = pipe(rawProps as Partial<PivProps>, handleShadowProps, handlePluginProps)
  // if (!props) return null // just for type, logicly it will never happen

  // handle have return null
  return 'dangerousRenderWrapperNode' in props
    ? handleDangerousWrapperPluginsWithChildren(props)
    : handleNormalPivProps(props)
}

function handleNormalPivProps(props: Omit<PivProps<any, any>, 'plugin' | 'shadowProps'>) {
  const parsedPivProps = parsePivProps(props)
  return 'render:self' in props ? props['render:self']?.(props) : <div {...parsedPivProps} />
}

function handleDangerousWrapperPluginsWithChildren(props: PivProps<any, any>): JSXElement {
  return flap(props['render:outWrapper']).reduce(
    (prevNode, getWrappedNode) => (getWrappedNode ? getWrappedNode(prevNode) : prevNode),
    createComponent(Piv, omit(props, 'render:outWrapper')),
  )
}
