import { createEffect } from 'solid-js'
import { DrawerController, DrawerProps } from '..'
import { handleKeyboardShortcut } from '../../../../domkit'
import { createPlugin } from '../../../../piv'
import { createControllerRef } from '../../../hooks/createControllerRef'
import { createRef } from '../../../hooks/createRef'

export const drawerKeyboardShortcut = createPlugin<DrawerProps>(() => {
  const [divRef, setDivRef] = createRef<HTMLDivElement>()
  const [drawerController, setControllerRef] = createControllerRef<DrawerController>()
  createEffect(() => {
    const el = divRef()
    if (!el) return
    keyboardFocusElement(el)
    const subscription = handleKeyboardShortcut(el, {
      'Escape': () => drawerController()?.close(),
    })
    return subscription.abort
  }, [])
  return { domRef: setDivRef, controllerRef: setControllerRef }
})

function keyboardFocusElement(el?: HTMLElement) {
  el?.focus()
}
