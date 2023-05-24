import { Accessor, createEffect } from 'solid-js'
import { UIKit, KitProps, Piv, PivProps, useKitProps } from '../../piv'
import { createSyncSignal } from '../hooks/createSyncSignal'
import { Accessify } from '../utils/accessifyProps'

export interface SwitchController {
  isChecked: Accessor<boolean>
}

export interface SwitchProps extends UIKit<{ controller: SwitchController }> {
  isChecked?: Accessify<boolean, SwitchController>
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
    get: () => props.isChecked ?? props.isDefaultChecked,
    set(value) {
      props.onChange?.({ isChecked: value })
    }
  })
  createEffect(() => {
    console.log('isChecked: ', isChecked())
  })
  lazyLoadController({
    isChecked
  })
  return (
    <Label
      shadowProps={props}
      icss={{
        width: '4em',
        height: '2em',
        background: 'gray'
      }}
      onClick={() => {
        setIsChecked(!isChecked())
      }}
    >
      <AbsoluteCheckboxInput defaultChecked={props.isDefaultChecked} />
      <Piv
        class='Switch'
        icss={{
          width: '2em',
          height: '2em',
          background: 'dodgerblue',
          translate: isChecked() ? '100%' : '0', //FIXME: why not work?
          transition: '300ms'
        }}
      />
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

interface CheckBoxInputProps extends UIKit {
  defaultChecked?: boolean
}

function AbsoluteCheckboxInput(rawProps: CheckBoxInputProps) {
  const { props } = useKitProps(rawProps)
  return (
    <Piv
      class='AbsoluteCheckboxInput'
      as={(parsedPivProps) => <input {...parsedPivProps} />}
      icss={{
        position: 'absolute',
        border: '0px',
        outline: 'none',
        opacity: 0,
        width: '1px',
        height: '1px',
        margin: '-1px',
        overflow: 'hidden'
      }}
      htmlProps={{
        type: 'checkbox',
        checked: props.defaultChecked
      }}
      shadowProps={props}
    />
  )
}
