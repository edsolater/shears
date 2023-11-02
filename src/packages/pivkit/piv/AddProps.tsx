// create a context  to past props
/**
 * this component is related to useKitProps
 */
import { createContext, useContext } from 'solid-js'
import { PivChild, PivProps, ValidProps, mergeProps, omit } from '.'
import { Fragnment } from './Fragnment'

/** set this to true, means addProps has already comsumed, no need subchildren to consume again */
/** 🤔 may be just set Context value to empty is enough? */
const addPropConsumed = Symbol('addPropConsumed')

/** add props is implied by solidjs context */
const _PropContext = createContext<{ props: unknown }[]>()

/**
 * `<PropContext>` is **Context** , not `<AddProps>` \
 * it will add props to all children components
 */
export function PropContext<Props extends ValidProps = PivProps>(props: Props) {
  const parentPropContext = useContext(_PropContext) ?? []
  const selfPropContextValue = parentPropContext.concat({
    props: omit(props, 'children'), // PropContext should not change inners children
  })
  return (
    <_PropContext.Provider value={selfPropContextValue}>
      <Fragnment>{props.children}</Fragnment>
    </_PropContext.Provider>
  )
}

/** add additional prop through solidjs context */
export function getPropsFromPropContextContext(componentInfo: { componentName: string }): ValidProps | undefined {
  const contextParent = useContext(_PropContext)
  if (!contextParent) return undefined
  const allPropses = contextParent.map(({ props }) => props as ValidProps)
  return mergeProps(...allPropses)
}
