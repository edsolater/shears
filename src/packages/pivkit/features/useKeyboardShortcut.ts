import { AnyObj, WeakerMap, WeakerSet, isFunction, isString, map, shakeNil } from '@edsolater/fnkit'
import { Accessor, createEffect, createMemo, createSignal, onCleanup } from 'solid-js'
import {
  KeyboardShortcutFn,
  KeybordShortcutKeys,
  handleKeyboardShortcut
} from '../../domkit/gesture/handleKeyboardShortcut'
import { Subscribable } from '../../fnkit/customizedClasses/Subscribable'
import { createRef } from '../hooks/createRef'

type DetailKeyboardShortcutSetting = {
  [key in KeybordShortcutKeys]?: {
    fn: KeyboardShortcutFn
    description?: string
  }
}

// hook info store, store registered keyboard shortcuts
const [registeredKeyboardShortcut, registeredKeyboardShortcutSubscribable] = makeSubscriable(
  new WeakerMap<HTMLElement, DetailKeyboardShortcutSetting>()
)
/**
 * just a wrapper for {@link handleKeyboardShortcut}
 * if you want regist global shortcut, please use {@link useKeyboardGlobalShortcut}
 */
export function useKeyboardShortcut(settings: DetailKeyboardShortcutSetting) {
  const [ref, setRef] = createRef()
  // register keyboard shortcut
  createEffect(() => {
    const el = ref()
    if (!el) return
    const shortcuts = shakeNil(map(settings, (detail) => detail?.fn))
    const { abort } = handleKeyboardShortcut(el, shortcuts)
    registeredKeyboardShortcut.set(el, settings)
    onCleanup(() => {
      abort()
      registeredKeyboardShortcut.delete(el)
    })
  })
  return { setRef }
}

/**
 * just a wrapper for {@link handleKeyboardShortcut}
 * if you want regist shortcut within a specific component, please use {@link useKeyboardShortcut}
 */
export function useKeyboardGlobalShortcut(settings: DetailKeyboardShortcutSetting) {
  // register keyboard shortcut
  createEffect(() => {
    const el = globalThis.document.documentElement
    const shortcuts = shakeNil(map(settings, (detail) => detail?.fn))
    const { abort } = handleKeyboardShortcut(el, shortcuts)
    const originalObject = registeredKeyboardShortcut.get(el)
    registeredKeyboardShortcut.set(el, { ...originalObject, ...settings })
    onCleanup(() => {
      abort()
      const originalObject = registeredKeyboardShortcut.get(el)
      if (originalObject) {
        const removedKeys = Object.keys(settings) as KeybordShortcutKeys[]
        removedKeys.forEach((key) => {
          delete originalObject[key]
        })
        registeredKeyboardShortcut.set(el, originalObject)
      }
    })
  })
}

/**
 * to get registered keyboard shortcut
 * usually, this hook is for show infos
 */
export function useAllRegisteredKeyboardShortcuts() {
  const keyboardShortcutSettingsSignal = useSubscribable(registeredKeyboardShortcutSubscribable, new WeakerMap())
  return keyboardShortcutSettingsSignal
}

export function useAllRegisteredGlobalShortcuts() {
  const keyboardShortcutSettingsSignal = useSubscribable(registeredKeyboardShortcutSubscribable, new WeakerMap())
  return createMemo(() => {
    const keyboardShortcutSettings = keyboardShortcutSettingsSignal()
    return keyboardShortcutSettings.get(globalThis.document.documentElement)
  })
}

// TODO: move to pivkit/hooks
export function useSubscribable<T>(subscribable: Subscribable<T>): Accessor<T | undefined>
export function useSubscribable<T>(subscribable: Subscribable<T>, defaultValue: T): Accessor<T>
export function useSubscribable<T>(subscribable: Subscribable<T>, defaultValue?: T) {
  const [value, setValue] = createSignal(subscribable.current ?? defaultValue)
  createEffect(() => {
    const { abort } = subscribable.subscribe(setValue)
    onCleanup(abort)
  })
  return value
}

// TODO: move to fnkit
/**
 * return a proxiedObject which will transmit the set change to originalObject and a subscribable which user can subscribe originalObject's value change
 * @param originalObject a pure version of object
 * @returns [proxiedObject, subscribable]
 */
export function makeSubscriable<T extends AnyObj>(
  originalObject: T
): [proxiedObject: T, subscribable: Subscribable<T>] {
  const mayCauseChangeKeys =
    originalObject instanceof Array
      ? ['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse']
      : originalObject instanceof Set || originalObject instanceof WeakSet || originalObject instanceof WeakerSet
      ? ['add', 'delete']
      : originalObject instanceof Map || originalObject instanceof WeakMap || originalObject instanceof WeakerMap
      ? ['set', 'delete']
      : Object.keys(originalObject)
  const subscribable = new Subscribable<T>()
  const proxiedValue = new Proxy(originalObject, {
    get(target, prop) {
      const v = Reflect.get(target, prop) as unknown
      if (isFunction(v) && isString(prop) && mayCauseChangeKeys.includes(prop)) {
        return ((...args: Parameters<typeof v>) => {
          const result = Reflect.apply(v, target, args)
          subscribable.inject(target)
          return result
        }).bind(target)
      } else {
        return v
      }
    },
    set(target, prop, value) {
      Reflect.set(target, prop, value)
      subscribable.inject(target)
      return true
    }
  })
  return [proxiedValue, subscribable]
}
