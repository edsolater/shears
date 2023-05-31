import { flap, omit } from '@edsolater/fnkit'
import { JSXElement, createComponent } from 'solid-js'
import { Dynamic } from 'solid-js/web'
import { parsePivProps } from './propHandlers/parsePivProps'
import { PivProps } from './types/piv'
import { ValidController } from './types/tools'

export const pivPropsNames = [
  'id',
  'children',
  'class',
  'htmlProps',
  'icss',
  'onClick',
  'plugin',
  'domRef',
  'shadowProps',
  'style',
  'debugLog',
  'innerController',

  'render:self',
  'render:nodeWrapper',
  'render:firstChild',
  'render:lastChild',
] satisfies (keyof PivProps<any>)[]

export const Piv = <
  TagName extends keyof HTMLElementTagNameMap = keyof HTMLElementTagNameMap,
  Controller extends ValidController | unknown = unknown,
>(
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
  // console.log('1212: ', 1212, props)
  const parsedPivProps = parsePivProps(props)
  return 'render:self' in props ? (
    <Dynamic component={props['render:self']} {...parsedPivProps} />
  ) : (
    <div {...parsedPivProps} />
  )
}

function handleDangerousWrapperPluginsWithChildren(props: PivProps<any, any>): JSXElement {
  return flap(props['render:nodeWrapper']).reduce(
    (prevNode, getWrappedNode) => (getWrappedNode ? getWrappedNode(prevNode) : prevNode),
    createComponent(Piv, omit(props, 'render:nodeWrapper')),
  )
}
