import { createEffect, createMemo, createSignal, on } from 'solid-js'
import { KitProps, Piv, PivProps, useKitProps } from '../../../piv'
import { createRef } from '../../hooks/createRef'
import { createToggle } from '../../hooks/createToggle'
import { Accessify, DeAccessifyProps } from '../../utils/accessifyProps'
import { parsePivProps } from '../../../piv'

export interface InputController {
  text: string
  /** set Input Value */
  setText(newText: string | undefined | ((oldText: string | undefined) => string | undefined)): void
}

export type InputProps = KitProps<
  {
    /**
     * will not apply default icss: `min-width: 10em`
     * input will auto widen depends on content Text
     * @todo
     */
    isFluid?: boolean

    // -------- handle by useInputInnerValue --------
    /** only after `<Input>` created */
    defaultValue?: string

    /** when change, affact to ui*/
    value?: string

    /** default is true */
    disableOutsideValueUpdateWhenUserInput?: boolean

    disableUserInput?: boolean

    // TODO: imply it !!!
    disableOutSideValue?: boolean

    /** disabled = disableOutSideValue + disableUserInput */
    disabled?: boolean

    // only user can trigger this callback
    onUserInput?(utils: { text: string | undefined }): void
    // both user and program can trigger this callback
    onInput?(utils: { text: string | undefined; byUser: boolean }): void
    // only program can trigger this callback
    onProgramInput?(utils: { text: string | undefined }): void
  },
  { controller: InputController }
>

/**
 * if for layout , don't render important content in Box
 */
export function Input(rawProps: InputProps) {
  const { props } = useKitProps(rawProps, {
    controller: (mergedProps) =>
      ({
        get text() {
          return innerText()
        },
        setText: updateText,
      } as InputController),
  })

  const [additionalProps, { innerText, updateText }] = useInputInnerValue(props)

  return (
    <Piv<'input'>
      render:self={(selfProps) => <input {...parsePivProps(selfProps)} />}
      shadowProps={[props, additionalProps()]}
      class={Input.name}
      icss={[
        { flex: 1, background: 'transparent', minWidth: props.isFluid ? undefined : '14em' },
        /* initialize */
        { border: 'none', padding: 8 },
      ]}
    />
  )
}

/**
 *  handle `<Input>`'s value
 */
function useInputInnerValue(props: DeAccessifyProps<InputProps>) {
  const [inputRef, setInputRef] = createRef<HTMLInputElement>()
  // if user is inputing or just input, no need to update upon out-side value
  const [isFocused, { on: focusInput, off: unfocusInput }] = createToggle()
  // store inner value for
  const [cachedOutsideValue, setCachedOutsideValue] = createSignal(props.defaultValue ?? props.value)

  /** DOM content */
  const [innerText, setInnerText] = createSignal(props.defaultValue ?? props.value)

  const updateTextDOMContent = (newText: string | undefined) => {
    const el = inputRef()
    if (el) {
      el.value = newText ?? ''
      setInnerText(newText)
      props.onProgramInput?.({ text: newText })
      props.onInput?.({ text: newText, byUser: false })
    }
  }

  // handle outside value change (will stay selection offset effect)
  const updateTextDOM = (newValue: string | undefined) => {
    const el = inputRef()
    const canChangeInnerValue = !(isFocused() && props.disableOutsideValueUpdateWhenUserInput)
    if (canChangeInnerValue && el) {
      const prevCursorOffsetStart = el.selectionStart ?? 0
      const prevCursorOffsetEnd = el.selectionEnd ?? 0
      const prevRangeDirection = el.selectionDirection ?? undefined
      const prevValue = cachedOutsideValue()
      // set real value by DOM API, for restore selectionRange
      updateTextDOMContent(newValue)
      const needUpdate = prevValue !== newValue && prevValue && newValue

      // restore selectionRange
      if (needUpdate) {
        const isCursor = prevCursorOffsetEnd === prevCursorOffsetStart
        const isCursorAtTail = isCursor && prevCursorOffsetEnd === prevValue.length
        const hasSelectAll = prevCursorOffsetStart === 0 && prevCursorOffsetEnd === prevValue.length
        if (isCursorAtTail) {
          // stay  end
          el.setSelectionRange(newValue.length, newValue.length) // to end
        } else if (hasSelectAll) {
          // stay select all
          el.setSelectionRange(prevCursorOffsetStart, newValue.length, prevRangeDirection) // to end
        } else {
          // stay same range offset
          el.setSelectionRange(prevCursorOffsetStart, prevCursorOffsetEnd, prevRangeDirection)
        }
      }
    }
    // in any case, it will update inner's js cachedOutsideValue
    setCachedOutsideValue(newValue)
  }

  // reflect default text in init lifecycle
  createEffect(on(inputRef, () => updateTextDOMContent(innerText())))

  // handle outside value change (consider selection offset)
  createEffect(
    on(
      () => props.value,
      (newValue) => {
        updateTextDOM(newValue)
      },
    ),
  )

  // update when lose focus
  createEffect(
    on(
      () => isFocused() === false,
      () => {
        setCachedOutsideValue(props.value)
      },
    ),
  )

  const additionalProps = createMemo(
    () =>
      ({
        domRef: setInputRef,
        htmlProps: {
          disabled: props.disabled,
          onBeforeInput: (ev: Event) => {
            // onBeforeInput to prevent user input
            if (props.disableUserInput) {
              ev.preventDefault()
            }
          },
          onInput: (e: Event) => {
            const text = (e.target as HTMLInputElement).value
            setInnerText(text)
            props.onInput?.({ text, byUser: true })
            props.onUserInput?.({ text })
          },
          onFocus: focusInput,
          onBlur: unfocusInput,
        },
      } as PivProps<'input'>),
  )
  return [
    additionalProps,
    {
      innerText,
      updateText: updateTextDOMContent,
      cachedOutsideValue,
      isFocused,
      focusInput,
      unfocusInput,
      setCachedOutsideValue,
    },
  ] as const
}
