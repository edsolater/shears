import { AnyObj } from '@edsolater/fnkit'
import { JSX, JSXElement, Show } from 'solid-js'
import { switchCase } from '../../../fnkit/switchCase'
import { PivProps } from '../Piv'
import { HTMLTag } from '../typeTools'
import { domMap } from './domMap'
import { NativeProps, parsePivProps } from './parsePivProps'

function getSolidJSXNode(type: HTMLTag, parsedProps: NativeProps, additionalProps?: AnyObj): JSX.Element | undefined {
  return switchCase(type, domMap(parsedProps, additionalProps))
}

/**
 * handle props:if and props:ifSelfShown
 */
export const renderHTMLDOM = (
  type: HTMLTag,
  rawProps: PivProps<any, any>,
  additionalProps?: Record<any, any>,
): JSXElement => {
  const { props, ifOnlyNeedRenderChildren, ifOnlyNeedRenderSelf, selfCoverNode } = parsePivProps(rawProps)

  if (selfCoverNode) return selfCoverNode

  if (ifOnlyNeedRenderChildren === undefined && ifOnlyNeedRenderSelf === undefined) {
    // most case
    return getSolidJSXNode(type, props, additionalProps)
  } else if (ifOnlyNeedRenderSelf === undefined) {
    return <Show when={ifOnlyNeedRenderChildren}>{getSolidJSXNode(type, props, additionalProps)}</Show>
  } else if (ifOnlyNeedRenderChildren === undefined) {
    return (
      <>
        <Show when={ifOnlyNeedRenderSelf}>{getSolidJSXNode(type, props, additionalProps)}</Show>
        <Show when={!ifOnlyNeedRenderSelf}>{props.children}</Show>
      </>
    )
  } else {
    return (
      <Show when={ifOnlyNeedRenderChildren}>
        <Show when={ifOnlyNeedRenderSelf}>{getSolidJSXNode(type, props, additionalProps)}</Show>
        <Show when={!ifOnlyNeedRenderSelf}>{props.children}</Show>
      </Show>
    )
  }
}
