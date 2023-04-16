import { Accessor, createEffect, createMemo, createSignal, onCleanup } from 'solid-js'
import { KitProps, ParsedKitProps, Piv, PivProps, useKitProps } from '../../piv'
import { createToggle } from '../hooks/createToggle'
import { createRef } from '../hooks/createRef'

export type InputProps = {
  /**
   * will not apply default icss: `min-width: 10em`
   * input will auto widen depends on content Text
   */
  isFluid?: boolean

  /** only after `<Input>` created */
  defaultValue?: string
  /** when change, affact to ui*/
  value?: string

  onUserInput?(utils: { text: string }): void
}

// css flexible
const cssInputPadding = 8 // (px)

/**
 * if for layout , don't render important content in Box
 */
export function Input(rawProps: KitProps<InputProps>) {
  const props = useKitProps<InputProps>(rawProps)
  const [additionalProps] = createInputInnerValue(props)

  return (
    <Piv<'input'>
      as={(parsedPivProps) => <input {...parsedPivProps} />}
      debugLog={['htmlProps']}
      shadowProps={[props, additionalProps()]}
      class={Input.name}
      icss={[
        { flex: 1, background: 'transparent', minWidth: props.isFluid ? undefined : '14em' },
        /* initialize */
        { border: 'none', padding: `${cssInputPadding}px` }
      ]}
    />
  )
}

/**
 *  handle `<Input>`'s value
 */
function createInputInnerValue(props: ParsedKitProps<InputProps>) {
  const [inputRef, setInputRef] = createRef<HTMLInputElement>()
  // if user is inputing or just input, no need to update upon out-side value
  const [isOutsideValueLocked, { on: lockOutsideValue, off: unlockOutsideValue }] = createToggle()
  const [innerValue, setInnerValue] = createSignal(props.defaultValue ?? props.value)
  createEffect(() => {
    const value = props.value
    value && setInnerValue(value)
  })
  const additionalProps = createMemo(
    () =>
      ({
        ref: setInputRef,
        htmlProps: {
          value: isOutsideValueLocked() ? innerValue() ?? props.value ?? '' : props.value ?? innerValue() ?? '',
          onInput: (e: Event) => {
            const text = (e.target as HTMLInputElement).value
            console.log('text: ', text)
            setInnerValue(text)
          }
        }
      } as PivProps<'input'>)
  )
  return [
    additionalProps,
    { innerValue, isOutsideValueLocked, lockOutsideValue, unlockOutsideValue, setInnerValue }
  ] as const
}
