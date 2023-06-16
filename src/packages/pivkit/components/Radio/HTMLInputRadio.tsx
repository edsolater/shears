import { Piv, UIKit, useKitProps } from '../../../piv'
import { parsePivProps } from '../../../piv'

export interface HTMLInputRadioProps extends UIKit {
  label?: string
  defaultChecked?: boolean
}
export function HTMLInputRadio(rawProps: HTMLInputRadioProps) {
  const { props } = useKitProps(rawProps)
  return (
    <Piv
      class='HTMLCheckbox'
      render:self={(selfProps) => <input {...parsePivProps(selfProps)} />}
      htmlProps={{
        type: 'radio',
        checked: props.defaultChecked,
        'aria-label': props.label ?? 'radio',
      }}
      shadowProps={props}
    />
  )
}
