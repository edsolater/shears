import { children } from 'solid-js'
import { PivChild, parsePivChildren } from '.'

/**
 * let outside is JSXElement, inner is PivChild
 */
export function Fragnment(props: { children?: PivChild }) {
  return <>{children(() => parsePivChildren(props.children))}</>
}
