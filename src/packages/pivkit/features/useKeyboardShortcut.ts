import { AnyObj, WeakerMap, WeakerSet, isFunction, isString } from '@edsolater/fnkit'
import { Accessor, createEffect, createSignal, onCleanup } from 'solid-js'
import { KeyboardShortcutSettings, handleKeyboardShortcut } from '../../domkit/gesture/handleKeyboardShortcut'
import { Subscribable } from '../../fnkit/customizedClasses/Subscribable'
import { createRef } from '../hooks/createRef'

const [registeredKeyboardShortcut, registeredKeyboardShortcutSubscribable] = makeSubscriable(
  new WeakerMap<HTMLElement, { bindLevel: 'specific' | 'global'; settings: KeyboardShortcutSettings }>()
)
/**
 * just a wrapper for {@link handleKeyboardShortcut}
 * if you want regist global shortcut, please use {@link useKeyboardGlobalShortcut}
 */
function useKeyboardShortcut(settings: KeyboardShortcutSettings) {
  const [ref, setRef] = createRef()
  // register keyboard shortcut
  createEffect(() => {
    const el = ref()
    if (!el) return
    const { abort } = handleKeyboardShortcut(el, settings)
    registeredKeyboardShortcut.set(el, { bindLevel: 'specific', settings })
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
function useKeyboardGlobalShortcut(settings: KeyboardShortcutSettings) {
  // register keyboard shortcut
  createEffect(() => {
    const el = globalThis.document.documentElement
    const { abort } = handleKeyboardShortcut(el, settings)
    registeredKeyboardShortcut.set(el, { bindLevel: 'global', settings })
    onCleanup(() => {
      abort()
      registeredKeyboardShortcut.delete(el)
    })
  })
}

/** a hook factory */
export function useKeyboardShortcutRegisterers() {
  return {
    registerGlobal: useKeyboardGlobalShortcut,
    registerLocal: useKeyboardShortcut,
    getAllRegistereds: useAllRegisteredKeyboardShortcuts
  }
}

/**
 * to get registered keyboard shortcut
 * usually, this hook is for show infos
 */
function useAllRegisteredKeyboardShortcuts() {
  const keyboardShortcutSettingsSignal = useSubscribable(registeredKeyboardShortcutSubscribable, new WeakerMap())
  return keyboardShortcutSettingsSignal
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
