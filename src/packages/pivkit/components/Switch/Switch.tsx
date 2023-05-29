import { Accessor } from 'solid-js'
import { Piv, PivProps, UIKit, useKitProps } from '../../../piv'
import { createSyncSignal } from '../../hooks/createSyncSignal'
import { Accessify } from '../../utils/accessifyProps'
import { makeElementMoveSmooth } from '../../hooks/makeElementMoveSmooth'
import { useSwitchStyle } from './hooks/useSwitchStyle'
import { LabelProps, Label } from '../Label'
import { HTMLCheckboxProps, HTMLCheckbox } from './HTMLCheckbox'

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
  'anatomy:AbsoluteCheckboxInput'?: HTMLCheckboxProps
  /** SwitchThumb */
  'anatomy:SwitchThumb'?: PivProps<any, SwitchController>
}

const selfProps = [
  'isChecked',
  'ariaLabel',
  'isDefaultChecked',
  'onChange',
  'anatomy:Label',
  'anatomy:AbsoluteCheckboxInput',
  'anatomy:SwitchThumb',
] satisfies (keyof SwitchProps)[]

const accessifyPropNames = ['isChecked', 'isDefaultChecked'] satisfies (keyof SwitchProps)[]

export type SwitchDefaultSwitchProps = typeof defaultProps

const defaultProps = {
  isDefaultChecked: false,
} satisfies Partial<SwitchProps>

/**
 * Switch can illustrate a boolean value
 */
export function Switch(rawProps: SwitchProps) {
  const { props, shadowProps, lazyLoadController } = useKitProps(rawProps, {
    defaultProps,
    needAccessify: accessifyPropNames,
    selfProps: selfProps,
  })

  const [isChecked, setIsChecked] = createSyncSignal({
    get: () => props.isChecked ?? props.isDefaultChecked,
    set(value) {
      props.onChange?.({ isChecked: value })
    },
  })

  const { wrapperLabelStyleProps, htmlCheckboxStyleProps, switchThumbStyleProps } = useSwitchStyle({ props, isChecked })

  const { setMotionTargetRef } = makeElementMoveSmooth({ observeOn: isChecked })

  const switchController = {
    isChecked,
  }

  lazyLoadController(switchController)

  return (
    <Label shadowProps={[wrapperLabelStyleProps(), shadowProps, props['anatomy:Label']]}>
      <HTMLCheckbox
        shadowProps={[htmlCheckboxStyleProps(), props['anatomy:AbsoluteCheckboxInput']]}
        innerController={switchController}
        ariaLabel={props.ariaLabel}
        defaultChecked={props.isDefaultChecked}
        onClick={() => {
          setIsChecked((b) => !b)
        }}
      />

      {/* SwitchThumb */}
      <Piv
        shadowProps={[switchThumbStyleProps(), props['anatomy:SwitchThumb']]}
        innerController={switchController}
        class='SwitchThumb'
        domRef={setMotionTargetRef}
        icss={{ display: 'grid', placeContent: 'center' }}
        render:appendChild={({ isChecked }) => {
          console.count('1')
          return (
            <Piv
              icss={{
                color: isChecked() ? 'dodgerblue' : 'crimson',
                width: '0.5em',
                height: '0.5em',
                backgroundColor: 'currentcolor',
                transition: '600ms',
              }}
            ></Piv>
          )
        }}
      />
    </Label>
  )
}
