import { Accessor, createEffect } from 'solid-js'
import { Piv, PivProps, UIKit, useKitProps } from '../../piv'
import { createSyncSignal } from '../hooks/createSyncSignal'
import { Accessify } from '../utils/accessifyProps'
import { parsePivProps } from '../../piv/propHandlers/parsePivProps'

export interface SwitchController {
  isChecked: Accessor<boolean>
}

export interface SwitchProps extends UIKit<{ controller: SwitchController }> {
  isChecked?: Accessify<boolean, SwitchController>
  ariaLabel?: string
  isDefaultChecked?: Accessify<boolean, SwitchController>
  onChange?(utils: { isChecked: boolean }): void
  /** for Chakra has, so i has */
  'anatomy:Label'?: LabelProps
  /** hidden HTML input(type=checkbox) for aria readbility */
  'anatomy:AbsoluteCheckboxInput'?: AbsoluteCheckboxInputProps
  /** SwitchThumb */
  'anatomy:SwitchThumb'?: PivProps
}

const selfProps = [
  'isChecked',
  'ariaLabel',
  'isDefaultChecked',
  'onChange',
  'anatomy:Label',
  'anatomy:AbsoluteCheckboxInput',
  'anatomy:SwitchThumb'
] satisfies (keyof SwitchProps)[]
const needDeAccessifyPropNames = ['isChecked', 'isDefaultChecked'] satisfies (keyof SwitchProps)[]

export type DefaultSwitchProps = typeof defaultProps

const defaultProps = {
  isDefaultChecked: false
} satisfies Partial<SwitchProps>

/**
 * Switch can illustrate a boolean value
 */
export function Switch(rawProps: SwitchProps) {
  const { props, shadowProps, lazyLoadController } = useKitProps(rawProps, {
    defaultProps,
    needAccessify: needDeAccessifyPropNames,
    selfProps: selfProps
  })
  const [isChecked, setIsChecked] = createSyncSignal({
    get: () => props.isChecked ?? props.isDefaultChecked,
    set(value) {
      props.onChange?.({ isChecked: value })
    }
  })
  // createEffect(() => {
  //   console.trace('isChecked: ', isChecked())
  // })
  lazyLoadController({
    isChecked
  })
  return (
    <Label
      shadowProps={[shadowProps, props['anatomy:Label']]}
      icss={{
        width: '4em',
        height: '2em',
        background: 'gray'
      }}
      onClick={() => {
        console.log('222: ', 222)
        setIsChecked((b) => !b)
      }}
    >
      <AbsoluteCheckboxInput
        shadowProps={props['anatomy:AbsoluteCheckboxInput']}
        ariaLabel={props.ariaLabel}
        defaultChecked={props.isDefaultChecked}
      />

      {/* SwitchThumb */}
      <Piv
        shadowProps={props['anatomy:SwitchThumb']}
        class='Switch'
        icss={{
          width: '2em',
          height: '2em',
          background: 'currentColor',
          translate: isChecked() ? '100%' : '0', //FIXME: why not work?
          transition: '300ms'
        }}
      />
    </Label>
  )
}

interface LabelProps extends PivProps {}
/**
 * created for form widget component
 */
function Label(rawProps: LabelProps) {
  const { props } = useKitProps(rawProps)
  return (
    <Piv
      class='Label'
      as={(parsedPivProps) => <label {...parsedPivProps} />} // why set as will render twice
      shadowProps={props}
    />
  )
}

interface AbsoluteCheckboxInputProps extends UIKit {
  ariaLabel?: string
  defaultChecked?: boolean
}

function AbsoluteCheckboxInput(rawProps: AbsoluteCheckboxInputProps) {
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
        checked: props.defaultChecked,
        'aria-label': props.ariaLabel ?? 'checkbox'
      }}
      shadowProps={props}
    />
  )
}
