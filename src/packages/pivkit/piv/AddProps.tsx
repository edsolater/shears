// create a context  to past props
/**
 * this component is related to useKitProps
 */
import { createContext, useContext } from 'solid-js'
import { PivChild, PivProps, ValidProps, mergeProps, omit } from '.'
import { Fragnment } from './Fragnment'

/** set this to true, means addProps has already comsumed, no need subchildren to consume again */
const addPropConsumed = Symbol('addPropConsumed')

/** add props is implied by solidjs context */
const AddPropContext = createContext<ValidProps[]>()

/**
 * `<PropContext>` is **Context** , not `<AddProps>` \
 * it will add props to all children components
 */
export function AddProps<Props extends ValidProps = PivProps>(props: Props) {
  const parentAddProp = useContext(AddPropContext)
  const selfContextValue = mergeProps(
    parentAddProp && parentAddProp[addPropConsumed] != true ? parentAddProp : undefined,
    omit(props, 'children'),
  )
  return (
    <AddPropContext.Provider value={selfContextValue}>
      <Fragnment>{props.children}</Fragnment>
    </AddPropContext.Provider>
  )
}

/** add additional prop through solidjs context */
export function getPropsFromAddPropContext(componentInfo: { componentName: string }): ValidProps | undefined {
  const additionalProps = useContext(AddPropContext)
  if (!additionalProps) return undefined
  if (additionalProps[addPropConsumed] === true) return undefined
  additionalProps[addPropConsumed] = true

  return additionalProps
}
