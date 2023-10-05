// create a context  to past props
/**
 * this component is related to useKitProps
 */
import { createContext, useContext } from 'solid-js'
import { PivChild, PivProps, ValidProps, mergeProps } from '.'
import { Fragnment } from './Fragnment'

/** add props is implied by solidjs context */
const InnerPropContext = createContext<{ props: unknown; when: PropContextWhen }[]>()

type PropContextWhen = (info: { componentName: string }) => boolean

export function PropContext<Props extends ValidProps = PivProps>(props: {
  additionalProps: Props
  when?: PropContextWhen
  children?: PivChild
}) {
  const parentPropContext = useContext(InnerPropContext)
  return (
    <InnerPropContext.Provider
      value={
        parentPropContext
          ? [...parentPropContext, { props: props.additionalProps, when: props.when ?? (() => true) }]
          : [{ props: props.additionalProps, when: props.when ?? (() => true) }]
      }
    >
      <Fragnment>{props.children}</Fragnment>
    </InnerPropContext.Provider>
  )
}

/** add additional prop through solidjs context */
export function getPropsFromPropContextContext(componentInfo: { componentName: string }): ValidProps | undefined {
  const contextParent = useContext(InnerPropContext)
  const props = contextParent?.map(({ props, when }) => (when(componentInfo) ? (props as ValidProps) : undefined))
  const merged = props && mergeProps(...props)
  return merged
}
