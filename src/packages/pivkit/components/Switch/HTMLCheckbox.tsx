import { Piv, UIKit, useKitProps } from '../../../piv'
import { parsePivProps } from '../../../piv/propHandlers/parsePivProps'

export interface HTMLCheckboxProps extends UIKit {
  ariaLabel?: string
  defaultChecked?: boolean
}
export function HTMLCheckbox(rawProps: HTMLCheckboxProps) {
  const { props } = useKitProps(rawProps)
  return (
    <Piv
      class='HTMLCheckbox'
      render:self={(selfProps) => <input {...parsePivProps(selfProps)} />}
      htmlProps={{
        type: 'checkbox',
        checked: props.defaultChecked,
        'aria-label': props.ariaLabel ?? 'checkbox',
      }}
      shadowProps={props}
    />
  )
}
