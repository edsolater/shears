import { Accessor } from 'solid-js'
import { Piv, PivProps, UIKit, useKitProps } from '../../../piv'
import { createSyncSignal } from '../../hooks/createSyncSignal'
import { makeElementMoveSmooth } from '../../hooks/makeElementMoveSmooth'
import { Accessify } from '../../utils/accessifyProps'
import { Label, LabelProps } from '../Label'
import { HTMLCheckbox, HTMLCheckboxProps } from './HTMLCheckbox'
import { useSwitchStyle } from './hooks/useSwitchStyle'
import { LabelBox } from '../LabelBox'

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
  name?: string
  isDefaultChecked?: Accessify<boolean, SwitchController>
  onChange?(utils: { isChecked: boolean }): void
  /** for Chakra has, so i has */
  'anatomy:ContainerBox'?: LabelProps
  /** hidden HTML input(type=checkbox) for aria readbility */
  'anatomy:HTMLCheckbox'?: HTMLCheckboxProps
  /** SwitchThumb */
  'anatomy:Thumb'?: PivProps<any, SwitchController>
}

const selfProps = [
  'isChecked',
  'name',
  'isDefaultChecked',
  'onChange',
  'anatomy:ContainerBox',
  'anatomy:HTMLCheckbox',
  'anatomy:Thumb',
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
    name: 'Switch',
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
    <LabelBox shadowProps={[wrapperLabelStyleProps, shadowProps, props['anatomy:ContainerBox']]}>
      <HTMLCheckbox
        shadowProps={[htmlCheckboxStyleProps, props['anatomy:HTMLCheckbox']]}
        innerController={switchController}
        label={props.name}
        defaultChecked={props.isDefaultChecked}
        onClick={() => {
          setIsChecked((b) => !b)
        }}
      />

      {/* SwitchThumb */}
      <Piv
        shadowProps={[switchThumbStyleProps, props['anatomy:Thumb']]}
        innerController={switchController}
        class='SwitchThumb'
        domRef={setMotionTargetRef}
        icss={[{ display: 'grid', placeContent: 'center' }]}
        // render:lastChild={({ isChecked }) => {
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
    </LabelBox>
  )
}
