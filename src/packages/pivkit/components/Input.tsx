import { createEffect, createMemo, createSignal, on, untrack } from 'solid-js'
import { KitProps, ParsedKitProps, Piv, PivProps, useKitProps } from '../../piv'
import { createRef } from '../hooks/createRef'
import { createToggle } from '../hooks/createToggle'

export type InputProps = {
  /**
   * will not apply default icss: `min-width: 10em`
   * input will auto widen depends on content Text
   * @todo
   */
  isFluid?: boolean

  /** only after `<Input>` created */
  defaultValue?: string
  /** when change, affact to ui*/
  value?: string

  disableOutsideValueUpdateWhenUserInput?: boolean

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
  const [isFocused, { on: focusInput, off: unfocusInput }] = createToggle()
  // store inner value for
  const [cachedOutsideValue, setCachedOutsideValue] = createSignal(props.defaultValue ?? props.value)

  // handle value change (consider selection offset)
  createEffect(() => {
    const newValue = props.value
    untrack(() => {
      const el = inputRef()
      const canChangeInnerValue = !(isFocused() && props.disableOutsideValueUpdateWhenUserInput)
      if (canChangeInnerValue && el) {
        const prevCursorOffsetStart = el?.selectionStart ?? 0
        const prevCursorOffsetEnd = el?.selectionEnd ?? 0
        const prevRangeDirection = el?.selectionDirection ?? undefined
        const prevValue = cachedOutsideValue()
        // set real value by DOM API, for restore selectionRange
        el.value = newValue ?? ''

        // restore selectionRange
        if (prevValue && newValue) {
          const isCursor = prevCursorOffsetEnd === prevCursorOffsetStart
          const isCursorAtTail = isCursor && prevCursorOffsetEnd === prevValue.length
          if (isCursorAtTail) {
            // stay  end
            el.setSelectionRange(newValue.length, newValue.length) // to end
          } else {
            // stay same range offset
            el.setSelectionRange(prevCursorOffsetStart, prevCursorOffsetEnd, prevRangeDirection)
          }
        }
      }
      // in any case, it will update inner's js cachedOutsideValue
      setCachedOutsideValue(newValue)
    })
  })

  createEffect(
    on(
      () => isFocused() === false,
      () => {
        setCachedOutsideValue(props.value)
      }
    )
  )

  const additionalProps = createMemo(
    () =>
      ({
        ref: setInputRef,
        htmlProps: {
          // value: isOutsideValueLocked() ? innerValue() ?? props.value ?? '' : props.value ?? innerValue() ?? '',
          onInput: (e: Event) => {
            const text = (e.target as HTMLInputElement).value
            setCachedOutsideValue(text)
            props.onUserInput?.({ text })
          },
          onFocus: focusInput,
          onBlur: unfocusInput
        }
      } as PivProps<'input'>)
  )
  return [additionalProps, { cachedOutsideValue, isFocused, focusInput, unfocusInput, setCachedOutsideValue }] as const
}
