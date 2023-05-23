import { Accessor } from 'solid-js'
import { UIKit, KitProps, Piv, PivProps, useKitProps } from '../../piv'
import { createSyncSignal } from '../hooks/createSyncSignal'
import { Accessify } from '../utils/accessifyProps'

export interface SwitchController {
  isChecked: Accessor<boolean>
}

export interface SwitchProps extends UIKit<{ controller: SwitchController }> {
  isDefaultChecked?: Accessify<boolean, SwitchController>
  onChange?(utils: { isChecked: boolean }): void
}

export type DefaultSwitchProps = typeof defaultProps

const defaultProps = {
  isDefaultChecked: false
} satisfies Partial<SwitchProps>

export function Switch(rawProps: SwitchProps) {
  const { props, lazyLoadController } = useKitProps(rawProps, { defaultProps })
  const [isChecked, setIsChecked] = createSyncSignal({
    get: () => props.isDefaultChecked,
    set(value) {
      props.onChange?.({ isChecked: value })
    }
  })
  lazyLoadController({
    isChecked
  })
  return (
    <Label
      shadowProps={props}
      onClick={() => {
        setIsChecked(!isChecked())
      }}
    >
      {isChecked() ? 'on' : 'off'}
    </Label>
  )
}

/**
 * created for form widget component
 */
function Label(rawProps: PivProps) {
  const { props } = useKitProps(rawProps)
  return <Piv class='Label' shadowProps={props} />
}
