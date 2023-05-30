import { Accessor } from 'solid-js'
import { Piv, PivProps, UIKit, useKitProps } from '../../../piv'
import { createSyncSignal } from '../../hooks/createSyncSignal'
import { makeElementMoveSmooth } from '../../hooks/makeElementMoveSmooth'
import { Accessify } from '../../utils/accessifyProps'
import { Label, LabelProps } from '../Label'
import { HTMLCheckbox, HTMLCheckboxProps } from './HTMLCheckbox'
import { useSwitchStyle } from './hooks/useSwitchStyle'

export interface SwitchController {
  isChecked: Accessor<boolean>
}

/**
 * every uikit should have this
 */
interface BaseComponentProps {
  shadowProps?: Partial<SwitchProps>
}

export interface SwitchProps extends Omit<UIKit<{ controller: SwitchController }>, 'shadowProps'>, BaseComponentProps {
  isChecked?: Accessify<boolean, SwitchController>
  ariaLabel?: string
  isDefaultChecked?: Accessify<boolean, SwitchController>
  onChange?(utils: { isChecked: boolean }): void
  /** for Chakra has, so i has */
  'anatomy:ContainerLabel'?: LabelProps
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
  'anatomy:ContainerLabel',
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

  const { wrapperLabelStyleProps, htmlCheckboxStyleProps, switchThumbStyleProps } = useSwitchStyle({ props })

  const { setMotionTargetRef } = makeElementMoveSmooth({ observeOn: isChecked })

  const switchController = {
    isChecked,
  }

  lazyLoadController(switchController)

  return (
    <Label shadowProps={[wrapperLabelStyleProps, shadowProps, props['anatomy:ContainerLabel']]}>
      <HTMLCheckbox
        shadowProps={[htmlCheckboxStyleProps, props['anatomy:AbsoluteCheckboxInput']]}
        innerController={switchController}
        ariaLabel={props.ariaLabel}
        defaultChecked={props.isDefaultChecked}
        onClick={() => {
          setIsChecked((b) => !b)
        }}
      />

      {/* SwitchThumb */}
      <Piv
        shadowProps={[switchThumbStyleProps, props['anatomy:SwitchThumb']]}
        innerController={switchController}
        class='SwitchThumb'
        domRef={setMotionTargetRef}
        icss={[{ display: 'grid', placeContent: 'center' }]}
        // render:appendChild={({ isChecked }) => {
        //   console.count('rerun thumb child')
        //   return (
        //     <Piv
        //       icss={{
        //         color: isChecked() ? 'dodgerblue' : 'crimson',
        //         width: '0.5em',
        //         height: '0.5em',
        //         backgroundColor: 'currentcolor',
        //         transition: '600ms',
        //       }}
        //     ></Piv>
        //   )
        // }}
      />
    </Label>
  )
}
