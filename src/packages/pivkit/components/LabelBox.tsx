import { KitProps, Piv, PivProps, UIKit, useKitProps } from '../../piv'
import { parsePivProps } from '../../piv'

export type LabelBoxProps = KitProps<{}>
/**
 * created for form widget component
 *
 * !`<label>` can transpond click/focus event for inner `<Input>`-like Node
 */
export function LabelBox(rawProps: LabelBoxProps) {
  const { props, shadowProps } = useKitProps(rawProps)
  return (
    <Piv
      render:self={(selfProps) => <label {...parsePivProps(selfProps)} />} // why set as will render twice
      shadowProps={shadowProps}
    />
  )
}
