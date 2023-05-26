import { Accessor, createMemo } from 'solid-js'
import { DeKitProps, Piv, PivProps, UIKit, useKitProps } from '../../piv'
import { createSyncSignal } from '../hooks/createSyncSignal'
import { Accessify } from '../utils/accessifyProps'
import { makeElementMoveSmooth } from '../hooks/makeElementMoveSmooth'

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

const accessifyPropNames = ['isChecked', 'isDefaultChecked'] satisfies (keyof SwitchProps)[]

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
    needAccessify: accessifyPropNames,
    selfProps: selfProps
  })

  const [isChecked, setIsChecked] = createSyncSignal({
    get: () => props.isChecked ?? props.isDefaultChecked,
    set(value) {
      props.onChange?.({ isChecked: value })
    }
  })

  const { wrapperLabelStyleProps, htmlCheckboxStyleProps, switchThumbStyleProps } = useSwitchStyle({ props, isChecked })

  const { setMotionTargetRef } = makeElementMoveSmooth({ observeOn: isChecked })

  lazyLoadController({
    isChecked
  })

  return (
    <Label shadowProps={[wrapperLabelStyleProps(), shadowProps, props['anatomy:Label']]}>
      <HTMLCheckbox
        shadowProps={[htmlCheckboxStyleProps(), props['anatomy:AbsoluteCheckboxInput']]}
        ariaLabel={props.ariaLabel}
        defaultChecked={props.isDefaultChecked}
        onClick={() => {
          setIsChecked((b) => !b)
        }}
      />

      {/* SwitchThumb */}
      <Piv
        class='SwitchThumb'
        domRef={setMotionTargetRef}
        shadowProps={[switchThumbStyleProps(), props['anatomy:SwitchThumb']]}
      />
    </Label>
  )
}

/**
 * hook for switch's **style**
 */
function useSwitchStyle(params: { props: DeKitProps<SwitchProps>; isChecked: Accessor<boolean> }) {
  const wrapperLabelStyleProps = createMemo(
    () =>
      ({
        icss: { width: '4em', height: '2em', background: 'gray', borderRadius: '999em', padding: 4 }
      } satisfies Partial<LabelProps>)
  )

  const htmlCheckboxStyleProps = createMemo(
    () =>
      ({
        icss: {
          position: 'absolute',
          border: '0px',
          outline: 'none',
          opacity: 0,
          width: '1px',
          height: '1px',
          margin: '-1px',
          overflow: 'hidden'
        }
      } satisfies Partial<HTMLCheckboxProps>)
  )

  const switchThumbStyleProps = createMemo(
    () =>
      ({
        icss: {
          height: '100%',
          aspectRatio: '1',
          borderRadius: '999em',
          background: 'currentColor',
          // translate: params.isChecked() ? '100%' : '0',
          marginLeft: params.isChecked() ? 'auto' : '0',
          transition: '300ms'
        }
      } satisfies Partial<PivProps>)
  )

  return { wrapperLabelStyleProps, htmlCheckboxStyleProps, switchThumbStyleProps }
}

interface LabelProps extends PivProps {}
/**
 * created for form widget component
 *
 * !`<label>` can transpond click/focus event for inner `<Input>`-like Node
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

interface HTMLCheckboxProps extends UIKit {
  ariaLabel?: string
  defaultChecked?: boolean
}

function HTMLCheckbox(rawProps: HTMLCheckboxProps) {
  const { props } = useKitProps(rawProps)
  return (
    <Piv
      class='HTMLCheckbox'
      as={(parsedPivProps) => <input {...parsedPivProps} />}
      htmlProps={{
        type: 'checkbox',
        checked: props.defaultChecked,
        'aria-label': props.ariaLabel ?? 'checkbox'
      }}
      shadowProps={props}
    />
  )
}
