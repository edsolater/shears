import { addEventListener, EventListenerController } from './addEventListener'
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

export type KeyboardShortcutSettings = {
  [key in KeybordShortcutKeys]?: KeyboardShortcutFn
}
export function handleKeyboardShortcut(
  el: HTMLElement,
  keyboardShortcutSettings: KeyboardShortcutSettings
): EventListenerController {
  const formatedKeyboardShortcutSetting = mapKey(keyboardShortcutSettings, (key) =>
    formatKeyboardSettingString(String(key))
  )
  addTabIndex(el) // keydown must have fousable element
  return addEventListener(el, 'keydown', ({ ev }) => {
    const pressedKey = getShorcutStringFromKeyboardEvent(ev)
    const targetShortcut = Reflect.get(formatedKeyboardShortcutSetting, pressedKey)
    targetShortcut?.()
  })
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

/**
 * parse from original KeyboardEvent to a string
 * @example
 * getShorcutStringFromKeyboardEvent(new KeyboardEvent('keydown', { ctrlKey: true, key: 'a' })) // 'ctrl + a'
 */
export function getShorcutStringFromKeyboardEvent(ev: KeyboardEvent) {
  const rawKey = areCaseInsensitiveEqual(ev.key, 'control') ? 'ctrl' : ev.key // special
  const keyArray = [ev.ctrlKey && 'ctrl', ev.shiftKey && 'shift', ev.altKey && 'alt', ev.metaKey && 'meta', rawKey]
  return unifyItem(shakeFalsy(keyArray).map(toLowerCase)).sort().join(' + ')
}

export function areCaseInsensitiveEqual(a: string, b: string) {
  return a.toLowerCase() === b.toLowerCase()
}

/**
 * @example
 * formatKeyboardSettingString('ctrl+SHIFT+alt+A') // 'alt + ctrl + shift + a'
 */
export function formatKeyboardSettingString(keyString: string) {
  const keyArray = keyString.split(/\s?\+\s?/)
  return unifyItem(shakeFalsy(keyArray).map(toLowerCase)).sort().join(' + ')
}
