import { createEffect } from 'solid-js'
import { ModalController, ModalProps } from '..'
import { handleKeyboardShortcut } from '../../../../domkit'
import { createPluginCreator } from '../../../../piv'
import { createControllerRef } from '../../../hooks/createControllerRef'
import { createRef } from '../../../hooks/createRef'

export const modalKeyboardShortcut = createPluginCreator<ModalProps>(() => () => {
  const [divRef, setDivRef] = createRef<HTMLDivElement>()
  const [modalController, setControllerRef] = createControllerRef<ModalController>()
  createEffect(() => {
    const el = divRef()
    if (!el) return
    keyboardFocusElement(el)
    const subscription = handleKeyboardShortcut(el, {
      'Escape': () => modalController()?.close(),
    })
    return subscription.abort
  }, [])
  return { domRef: setDivRef, controllerRef: setControllerRef }
})

function keyboardFocusElement(el?: HTMLElement) {
  el?.focus()
}
