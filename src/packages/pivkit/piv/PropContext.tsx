// create a context  to past props
/**
 * this component is related to useKitProps
 */
import { createContext, useContext } from 'solid-js'
import { PivChild, PivProps, ValidProps, mergeProps, omit } from '.'
import { Fragnment } from './Fragnment'

/** add props is implied by solidjs context */
const _PropContext = createContext<{ props: unknown; when?: PropContextWhen }[]>()

type PropContextWhen = (info: { componentName: string }) => boolean

/**
 * `<PropContext>` is **Context** , not `<AddProps>`
 */
export function PropContext<Props extends ValidProps = PivProps>(props: {
  additionalProps?: Props
  /** for faster debug, if not set, it is alw */
  when?: PropContextWhen
  children?: PivChild
}) {
  const parentPropContext = useContext(_PropContext) ?? []
  const selfPropContextValue = parentPropContext.concat({
    props: props.additionalProps,
    when: props.when,
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
  const allPropses = contextParent
    .filter(({ when }) => (when ? (when(componentInfo) ? true : undefined) : true))
    .map(({ props }) => props as ValidProps)
  return mergeProps(...allPropses)
}
