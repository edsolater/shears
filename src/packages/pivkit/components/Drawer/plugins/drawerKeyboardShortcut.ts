import { createEffect } from 'solid-js'
import { DrawerController, DrawerProps } from '..'
import { handleKeyboardShortcut } from '../../../../domkit/gesture/handleKeyboardShortcut'
import { createPlugin } from '../../../../piv/propHandlers/plugin'
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
      'Escape': () => drawerController()?.close()
    })
    return subscription.abort
  }, [])
  return { ref: setDivRef, controllerRef: setControllerRef, open: true }
})

function keyboardFocusElement(el?: HTMLElement) {
  el?.focus()
}
