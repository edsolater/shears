import { Accessor } from 'solid-js'
import { KitProps, Piv, PivProps, ValidController, useKitProps } from '../../../piv'
import { createSyncSignal } from '../../hooks/createSyncSignal'
import { Label, LabelProps } from '../Label'
import { LabelBox, LabelBoxProps } from '../LabelBox'
import { HTMLInputRadio, HTMLInputRadioProps } from './HTMLInputRadio'
import { createRadioStyle } from './hooks/createRadioStyle'

export interface RadioController {
  option: string
  isChecked: Accessor<boolean>
  check: () => void
  uncheck: () => void
}

export type RadioProps<Controller extends ValidController = RadioController> = KitProps<
  {
    option: string
    isChecked?: boolean
    onChange?(utils: { option: string; isChecked: boolean }): void
    'anatomy:ContainerBox'?: LabelBoxProps
    'anatomy:HTMLRadio'?: HTMLInputRadioProps
    'anatomy:Checkbox'?: PivProps<'div', Controller>
    'anatomy:Option'?: LabelProps
  },
  { controller: Controller }
>

const selfProps = ['isChecked', 'option', 'onChange'] satisfies (keyof RadioProps)[]

export type RadioDefaultRadioProps = typeof defaultProps

const defaultProps = {
  isChecked: false,
} satisfies Partial<RadioProps>

/**
 * Radio can illustrate a boolean value
 */
export function Radio(rawProps: RadioProps) {
  const { props, shadowProps, lazyLoadController } = useKitProps(rawProps, {
    defaultProps,
    selfProps: selfProps,
  })

  const [isChecked, setIsChecked] = createSyncSignal({
    get: () => props.isChecked,
    set(value) {
      props.onChange?.({ isChecked: value, option: props.option ?? '' })
    },
  })

  const check = () => setIsChecked(true)
  const uncheck = () => setIsChecked(false)

  const { containerBoxStyleProps, htmlCheckboxStyleProps, radioCheckboxStyleProps, radioLabelStyleProps } =
    createRadioStyle({ props })

  const radioController = {
    isChecked,
    check,
    uncheck,
    get option() {
      return props.option
    },
  }

  lazyLoadController(radioController)

  return (
    <LabelBox shadowProps={[containerBoxStyleProps, shadowProps, props['anatomy:ContainerBox']]}>
      <HTMLInputRadio
        shadowProps={[htmlCheckboxStyleProps, props['anatomy:HTMLRadio']]}
        innerController={radioController}
        label={props.option}
        defaultChecked={props.isChecked}
        onClick={() => {
          setIsChecked((b) => !b)
        }}
      />

      {/* Radio Checkbox */}
      <Piv
        shadowProps={[radioCheckboxStyleProps, props['anatomy:Checkbox']]}
        innerController={radioController}
        class='RadioCheckbox'
        icss={[{ display: 'grid', placeContent: 'center' }]}
      />

      {/* Radio Label */}
      <Label shadowProps={[radioLabelStyleProps, props['anatomy:Option']]}>{props.option}</Label>
    </LabelBox>
  )
}
