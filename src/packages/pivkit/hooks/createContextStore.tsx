import { isFunction, isString, ShakeNever, uncapitalize } from '@edsolater/fnkit'
import { createContext, createEffect, JSXElement, mergeProps, splitProps, useContext } from 'solid-js'
import { createStore } from 'solid-js/store'

type Store<T extends Record<string, any>> = ShakeNever<{
  [K in keyof T]: T[K] extends (...args: any[]) => any ? T[K] : () => T[K]
} & {
  [K in keyof T as `set${Capitalize<K & string>}`]: T[K] extends (...args: any[]) => any
    ? never
    : K extends `set${string}`
    ? never
    : (dispatcher: ((newValue: T[K], prevValue?: T[K]) => T[K]) | T[K]) => T[K]
}>
/** proxy with additional set* and onChange* methods */
export function createContextStore<T extends Record<string, any>>(
  defaultValue?: T,
  options?: {
    name?: string
  }
): [
  Provider: (
    props: {
      children?: JSXElement
    } & Partial<T>
  ) => JSXElement,
  useStore: () => Store<T>
] {
  const Context = createContext(defaultValue ?? ({} as T), { name: options?.name })
  const onChangeMap = new Map<string, WeakRef<(newValue: unknown, prevValue?: unknown) => void>[] | undefined>()
  const [rawStore, setRawStore] = createStore(defaultValue)
  const proxiedStore = new Proxy(rawStore, {
    // result contain keys info
    get: (target, p, receiver) => {
      const targetType = isString(p) && p.startsWith('set') ? 'setter' : 'getter'

      if (targetType === 'setter') {
        const propertyName = uncapitalize((p as string).slice('set'.length))
        return (dispatch: ((newValue: unknown, prevValue?: unknown) => unknown) | unknown) => {
          const prevValue = Reflect.get(target, propertyName, receiver)
          const newValue = isFunction(dispatch) ? dispatch(prevValue) : dispatch
          if (prevValue === newValue) return // no need to update store with the same value

          // invoke exist callbacks
          onChangeMap.get(propertyName)?.forEach((ref) => {
            ref.deref()?.(newValue, prevValue)
          })
          setRawStore({ [propertyName]: newValue })
          return newValue
        }
      }

      if (targetType === 'getter') {
        return p in target ? () => Reflect.get(target, p, receiver) : () => {}
      }
    }
  })

  const Provider = (props: { children?: JSXElement } & Partial<T>) => {
    const [childrenProps, otherProps] = splitProps(props, ['children'])
    createEffect(() => setRawStore(mergeProps(defaultValue, otherProps)))
    return (
      <Context.Provider value={proxiedStore as unknown as any /* noneed to check type here */}>
        {childrenProps.children}
      </Context.Provider>
    )
  }

  const useStore = () => useContext(Context) as unknown as Store<T> /* noneed to check type here */

  return [Provider, useStore]
}
