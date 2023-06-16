import { Piv, PivProps, UIKit, useKitProps } from '../../piv'
import { parsePivProps } from '../../piv'
import { Text } from './Text'

export interface LabelProps extends UIKit<{ controller: { sdf: number } }> {}
/**
 * created for form widget component
 *
 * !`<label>` can transpond click/focus event for inner `<Input>`-like Node
 */
export function Label(rawProps: LabelProps) {
  const { shadowProps, props } = useKitProps(rawProps)
  return <Text class='Label' shadowProps={shadowProps} />
}
