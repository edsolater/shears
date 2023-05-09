import { createEffect, createSignal, on, onCleanup } from 'solid-js'
import { onEvent } from '../../../../domkit'
import { KeybordShortcutKeys, getShorcutStringFromKeyboardEvent } from '../../../../domkit/gesture/handleKeyboardShortcut'
import { Subscribable } from '../../../../fnkit/customizedClasses/Subscribable'
import { createPlugin } from '../../../../piv/propHandlers/plugin'
import { createControllerRef } from '../../../hooks/createControllerRef'
import { createRef } from '../../../hooks/createRef'
import { InputController, InputProps } from '../Input'

// NOTE: plugin is a function accept props and return additional props
// TODO: apply `createConfigableFunction((options) => (props) => {...})`
export const keyboardShortcutObserverPlugin = (options: { onRecordShortcut?: (shortcut: KeybordShortcutKeys) => void }) =>
  createPlugin<InputProps, InputController>((inputProps) => {
    const [elRef, setElRef] = createRef<HTMLDivElement>()

    const [controllerRef, setControllerRef] = createControllerRef<InputController>()
    const [recordedShortcut, setRecordedShortcut] = createSignal<string | undefined>(undefined)
    createEffect(() => {
      const el = elRef()
      if (!el) return
      const subscribable = subscribeKeyboardShortcut(el)
      const { unsubscribe } = subscribable.subscribe(handleKeydownKeyboardShortcut)
      onCleanup(unsubscribe)
    })

    // reflect recorded shortcut to input value
    createEffect(
      on(recordedShortcut, () => {
        controllerRef()?.setText(recordedShortcut())
      })
    )

    const handleKeydownKeyboardShortcut = (text: string) => {
      setRecordedShortcut(text)
      controllerRef()?.setText(text)
      options.onRecordShortcut?.(text as KeybordShortcutKeys)
    }

    return { ref: setElRef, controllerRef: setControllerRef }
  })

function subscribeKeyboardShortcut(el: HTMLElement) {
  const subscri = new Subscribable<string>()
  onEvent(el, 'keydown', ({ ev }) => {
    ev.stopPropagation()
    const shortcut = getShorcutStringFromKeyboardEvent(ev)
    if (isValidShortcut(ev)) subscri.inject(shortcut)
  })
  return subscri
}

function isValidShortcut(ev: KeyboardEvent, options?: { banedKeywords?: string[] }): boolean {
  return ['control', 'alt', 'shift', 'meta', 'backspace', 'enter', ...(options?.banedKeywords ?? [])].every(
    (key) => !ev.key.toLowerCase().includes(key.toLowerCase())
  )
}
