import { Accessor } from 'solid-js'
import { KitProps, Piv, PivProps, ValidController, useKitProps } from '../../../piv'
import { createSyncSignal } from '../../hooks/createSyncSignal'
import { makeElementMoveSmooth } from '../../hooks/makeElementMoveSmooth'
import { Label, LabelProps } from '../Label'
import { LabelBox, LabelBoxProps } from '../LabelBox'
import { HTMLInputRadio, HTMLInputRadioProps } from './HTMLInputRadio'
import { useRadioStyle } from './hooks/useRadioStyle'

export interface RadioController {
  name: string
  isChecked: Accessor<boolean>
}

export type RadioProps<PassedController extends ValidController = RadioController> = KitProps<
  {
    name: string
    isChecked?: boolean
    onChange?(utils: { name: string; isChecked: boolean }): void
    'anatomy:container'?: LabelBoxProps
    'anatomy:htmlRadioInput'?: HTMLInputRadioProps
    'anatomy:control'?: PivProps<'div', PassedController>
    'anatomy:label'?: LabelProps
  },
  { controller: PassedController }
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

  const { wrapperLabelStyleProps, htmlCheckboxStyleProps, radioThumbStyleProps } = useRadioStyle({ props })

  const { setMotionTargetRef } = makeElementMoveSmooth({ observeOn: isChecked })

  const radioController = {
    isChecked,
  }

  lazyLoadController(radioController)

  return (
    <LabelBox shadowProps={[wrapperLabelStyleProps, shadowProps, props['anatomy:container']]}>
      <HTMLInputRadio
        shadowProps={[htmlCheckboxStyleProps, props['anatomy:htmlRadioInput']]}
        innerController={radioController}
        label={props.name}
        defaultChecked={props.isChecked}
        onClick={() => {
          setIsChecked((b) => !b)
        }}
      />

      {/* RadioThumb */}
      <Piv
        shadowProps={[radioThumbStyleProps, props['anatomy:control']]}
        innerController={radioController}
        class='RadioThumb'
        domRef={setMotionTargetRef}
        icss={[{ display: 'grid', placeContent: 'center' }]}
      />

      {/* RadioLabel */}
      <Label shadowProps={[props['anatomy:label']]}>{props.name}</Label>
    </LabelBox>
  )
}
