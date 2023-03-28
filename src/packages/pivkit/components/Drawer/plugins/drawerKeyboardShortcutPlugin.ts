import { createEffect } from 'solid-js'
import { DrawerProps } from '..'
import { handleKeyboardShortcut } from '../../../../domkit/gesture/handleKeyboardShortcut'
import { createPlugin } from '../../../../piv/plugin'
import { createRef } from '../../../hooks/createRef'

export type DrawerKeyboardShortcutPlugin = {}

export const drawerKeyboardShortcutPlugin = createPlugin<DrawerProps>(() => {
  const [divRef, setDivRef] = createRef<HTMLDivElement>()
  createEffect(() => {
    if (!divRef()) return
    const subscription = handleKeyboardShortcut(divRef()!, {
      // TODO: should create  use component controller hook
      // 'ArrowDown': drawerController.current?.toNext,
      // 'ArrowUp': drawerController.current?.toPrev,
      // 'ctrl + ArrowUp': drawerController.current?.toFirst,
      // 'Home': drawerController.current?.toFirst,
      // 'ctrl + ArrowDown': drawerController.current?.toLast,
      // 'End': drawerController.current?.toLast
    })
    return subscription.abort
  }, [])
  return { componentRef: setDivRef }
})
