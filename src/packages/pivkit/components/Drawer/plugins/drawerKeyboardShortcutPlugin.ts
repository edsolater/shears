import { createEffect } from 'solid-js'
import { DrawerController, DrawerProps } from '..'
import { handleKeyboardShortcut } from '../../../../domkit/gesture/handleKeyboardShortcut'
import { createPlugin } from '../../../../piv/plugin'
import { createControllerRef } from '../../../hooks/createControllerRef'
import { createRef } from '../../../hooks/createRef'

export type DrawerKeyboardShortcutPlugin = {}

export const drawerKeyboardShortcutPlugin = createPlugin<DrawerProps>(() => {
  const [divRef, setDivRef] = createRef<HTMLDivElement>()
  const [drawerController, setControllerRef] = createControllerRef<DrawerController>()
  createEffect(() => {
    const el = divRef()
    if (!el) return
    keyboardFocusElement(el)
    const subscription = handleKeyboardShortcut(el, {
      'Escape': () => {
        console.log('press esc', drawerController())
        return drawerController()?.close() // TODO: urgly, try a prettier here
      } // TODO: urgly, try a prettier here
    })
    return subscription.abort
  }, [])
  return { ref: setDivRef, controllerRef: setControllerRef, open: true }
})

function keyboardFocusElement(el?: HTMLElement) {
  el?.focus()
}
