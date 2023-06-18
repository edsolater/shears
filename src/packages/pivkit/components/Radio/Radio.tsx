import { Accessor } from 'solid-js'
import { KitProps, Piv, PivProps, ValidController, useKitProps } from '../../../piv'
import { createSyncSignal } from '../../hooks/createSyncSignal'
import { makeElementMoveSmooth } from '../../hooks/makeElementMoveSmooth'
import { Label, LabelProps } from '../Label'
import { LabelBox, LabelBoxProps } from '../LabelBox'
import { HTMLInputRadio, HTMLInputRadioProps } from './HTMLInputRadio'
import { createRadioStyle } from './hooks/createRadioStyle'

export interface RadioController {
  name: string
  isChecked: Accessor<boolean>
}

export type RadioProps<Controller extends ValidController = RadioController> = KitProps<
  {
    name: string
    isChecked?: boolean
    onChange?(utils: { name: string; isChecked: boolean }): void
    'anatomy:ContainerBox'?: LabelBoxProps
    'anatomy:HTMLRadio'?: HTMLInputRadioProps
    'anatomy:Checkbox'?: PivProps<'div', Controller>
    'anatomy:OptionLabel'?: LabelProps
  },
  { controller: Controller }
>

const selfProps = ['isChecked', 'name', 'onChange'] satisfies (keyof RadioProps)[]

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
      props.onChange?.({ isChecked: value, name: props.name ?? '' })
    },
  })

  const { containerBoxStyleProps, htmlCheckboxStyleProps, radioCheckboxStyleProps, radioLabelStyleProps } =
    createRadioStyle({ props })

  const radioController = {
    isChecked,
  }

  lazyLoadController(radioController)

  return (
    <LabelBox shadowProps={[containerBoxStyleProps, shadowProps, props['anatomy:ContainerBox']]}>
      <HTMLInputRadio
        shadowProps={[htmlCheckboxStyleProps, props['anatomy:HTMLRadio']]}
        innerController={radioController}
        label={props.name}
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
      <Label shadowProps={[radioLabelStyleProps, props['anatomy:OptionLabel']]}>{props.name}</Label>
    </LabelBox>
  )
}
