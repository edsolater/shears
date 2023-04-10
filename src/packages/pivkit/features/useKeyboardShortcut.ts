import { createEffect, onCleanup } from 'solid-js'
import { KeyboardShortcutSettings, handleKeyboardShortcut } from '../../domkit/gesture/handleKeyboardShortcut'
import { createRef } from '../hooks/createRef'

/**
 * just a wrapper for {@link handleKeyboardShortcut}
 * if you want regist global shortcut, please use {@link useKeyboardGlobalShortcut}
 */
// TODO: apply this hook it
export function useKeyboardShortcut(settings: KeyboardShortcutSettings) {
  const [ref, setRef] = createRef()

  createEffect(() => {
    const el = ref()
    if (!el) return
    const { abort } = handleKeyboardShortcut(el, settings)
    onCleanup(abort)
  })

  return { setRef }
}

/**
 * just a wrapper for {@link handleKeyboardShortcut}
 * if you want regist shortcut within a specific component, please use {@link useKeyboardShortcut}
 */
export function useKeyboardGlobalShortcut(settings: KeyboardShortcutSettings) {
  createEffect(() => {
    const el = globalThis.document.documentElement
    const { abort } = handleKeyboardShortcut(el, settings)
    onCleanup(abort)
  })
  return {}
}

// for info access
export function useRegistedKeyboardShortcuts(){
  
}