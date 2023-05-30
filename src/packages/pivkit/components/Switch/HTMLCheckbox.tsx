import { Piv, UIKit, useKitProps } from '../../../piv'

export interface HTMLCheckboxProps extends UIKit {
  ariaLabel?: string
  defaultChecked?: boolean
}
export function HTMLCheckbox(rawProps: HTMLCheckboxProps) {
  const { props } = useKitProps(rawProps)
  return (
    <Piv
      class='HTMLCheckbox'
      as={(parsedPivProps) => <input {...parsedPivProps} />}
      htmlProps={{
        type: 'checkbox',
        checked: props.defaultChecked,
        'aria-label': props.ariaLabel ?? 'checkbox',
      }}
      shadowProps={props}
    />
  )
}
