import {
  addEventListener,
  EventListenerController,
  ComposedEventListenerControllers,
  composeMultiListenerControllers
} from './addEventListener'
import { mapKey, shakeFalsy, toLowerCase, unifyItem } from '@edsolater/fnkit'
import { addTabIndex } from './addTabIndex'

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values
 */
export type ContentKeyName = KeyNamesActionKey | KeyNamesNavigation | KeyNamesNormalContent
export type AuxiliaryKeyName =
  | 'ctrl'
  | 'shift'
  | 'alt'
  | 'ctrl + alt'
  | 'ctrl + shift'
  | 'alt + shift'
  | 'ctrl + shift + alt'
type KeyNamesActionKey = `F${number}` | 'Backspace' | 'Enter' | 'Escape' | 'Delete' | 'Insert' | ' '
type KeyNamesNormalContent =
  | '`'
  | '1'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | '0'
  | '-'
  | '='
  | 'q'
  | 'w'
  | 'e'
  | 'r'
  | 't'
  | 'y'
  | 'u'
  | 'i'
  | 'o'
  | 'p'
  | '['
  | ']'
  | '\\'
  | 'a'
  | 's'
  | 'd'
  | 'f'
  | 'g'
  | 'h'
  | 'j'
  | 'k'
  | 'l'
  | ';'
  | "'"
  | 'z'
  | 'x'
  | 'c'
  | 'v'
  | 'b'
  | 'n'
  | 'm'
  | ','
  | '.'
  | '/'
type KeyNamesNavigation =
  | 'Tab'
  | 'Home'
  | 'PageUp'
  | 'PageDown'
  | 'End'
  | 'ArrowUp'
  | 'ArrowLeft'
  | 'ArrowRight'
  | 'ArrowDown'
export type KeybordShortcutKeys = `${`${AuxiliaryKeyName} + ` | ''}${ContentKeyName}`
export type KeyboardShortcutFn = () => void

// TODO: not imply yet
export type KeyboardShortcutSetting = {
  key: KeybordShortcutKeys
  el?: HTMLElement // is documentElement if not specified
  description?: string
  when?: unknown // not ready yet
  fn: KeyboardShortcutFn
}

export function handleKeyboardShortcut(
  ...keyboardShortcutSettings: KeyboardShortcutSetting[]
): ComposedEventListenerControllers {
  const controllers: EventListenerController[] = []
  for (const setting of keyboardShortcutSettings) {
    const { key, el = document.documentElement, fn } = setting
    const formattedKey = formatKeyboardSettingString(key)
    const eventController = addEventListener(el, 'keydown', ({ ev }) => {
      const pressedKey = parseKeyboardEventToReadableKeyString(ev)
      if (pressedKey === formattedKey) {
        fn()
      }
    })
    controllers.push(eventController)
  }
  return composeMultiListenerControllers(controllers)
}

/** this still not prevent **all** brower shortcut (like build-in ctrl T ) */
export function preventDefaultKeyboardShortcut(pureEl: HTMLElement) {
  pureEl.addEventListener(
    'keydown',
    (ev) => {
      ev.stopPropagation()
      ev.preventDefault()
    },
    { capture: true }
  )
}
function parseKeyboardEventToReadableKeyString(ev: KeyboardEvent) {
  const keyArray = [ev.ctrlKey && 'ctrl', ev.shiftKey && 'shift', ev.altKey && 'alt', ev.metaKey && 'meta', ev.key]
  return unifyItem(shakeFalsy(keyArray).map(toLowerCase)).sort().join(' + ')
}
function formatKeyboardSettingString(keyString: string) {
  const keyArray = keyString.split(/\s?\+\s?/)
  return unifyItem(shakeFalsy(keyArray).map(toLowerCase)).sort().join(' + ')
}
