import { createEffect, createSignal, on, onCleanup } from 'solid-js'
import { onEvent } from '../../../../domkit'
import { getShorcutStringFromKeyboardEvent } from '../../../../domkit/gesture/handleKeyboardShortcut'
import { Subscribable } from '../../../../fnkit/customizedClasses/Subscribable'
import { createPlugin } from '../../../../piv/propHandlers/plugin'
import { createControllerRef } from '../../../hooks/createControllerRef'
import { createRef } from '../../../hooks/createRef'
import { InputController, InputProps } from '../Input'

export const shortcutInputPlugin = createPlugin<InputProps, InputController>(() => {
  const [elRef, setElRef] = createRef<HTMLDivElement>()

  const [controllerRef, setControllerRef] = createControllerRef<InputController>()
  const [recordedShortcut, setRecordedShortcut] = createSignal<string | undefined>(undefined)
  createEffect(() => {
    const el = elRef()
    if (!el) return
    const subscri = recordShortcut(el)
    const { abort } = subscri.subscribe(handleKeydownKeyboardShortcut)
    onCleanup(abort)
  })
  createEffect(
    on(recordedShortcut, () => {
      controllerRef()?.setText(recordedShortcut())
    })
  )

  const handleKeydownKeyboardShortcut = (text: string) => {
    setRecordedShortcut(text)
    controllerRef()?.setText(text)
  }

  return { ref: setElRef, controllerRef: setControllerRef }
})

function recordShortcut(el: HTMLElement) {
  const subscri = new Subscribable<string>()
  onEvent(el, 'keydown', ({ ev }) => {
    ev.stopPropagation()
    const shortcut = getShorcutStringFromKeyboardEvent(ev)
    subscri.inject(shortcut)
  })
  return subscri
}
