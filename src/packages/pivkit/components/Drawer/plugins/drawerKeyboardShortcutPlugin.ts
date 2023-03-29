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
    console.log('el: ', el)
    if (!el) return
    el.focus()
    const subscription = handleKeyboardShortcut(el, {
      // 'ArrowDown': drawerController()?.toNext,
      // 'ArrowUp': drawerController()?.toPrev,
      // 'ctrl + ArrowUp': drawerController()?.toFirst,
      // 'Home': drawerController()?.toFirst,
      // 'ctrl + ArrowDown': drawerController()?.toLast,
      // 'End': drawerController()?.toLast,
      'Escape': drawerController()?.().close // TODO: urgly, try a prettier here
    })
    return subscription.abort
  }, [])
  return { ref: setDivRef, controller: setControllerRef }
})
