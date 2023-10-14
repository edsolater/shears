import { createContext, createEffect, JSXElement, mergeProps, splitProps, useContext } from 'solid-js'
import { createSmartStore, CreateProxiedStoreCallbacks } from './createSmartStore'
import { DefaultStoreValue, OnChangeCallback, Store } from './type'

export function createContextStore<T extends Record<string, any>>(
  defaultValue?: DefaultStoreValue<T>,
  options?: {
    name?: string
  } & CreateProxiedStoreCallbacks<T>,
): [
  Provider: (
    props: {
      children?: JSXElement
    } & Partial<T>,
  ) => JSXElement,
  useStore: () => Store<T>,
  rawStore: T,
  onPropertyChange: <K extends keyof T>(key: K, cb: OnChangeCallback<T, K>) => { abort(): void },
] {
  const { store, _rawStore, onPropertyChange } = createSmartStore(defaultValue, options)
  const Context = createContext(defaultValue ?? ({} as T), { name: options?.name })
  const Provider = (props: { children?: JSXElement } & Partial<T>) => {
    const [childrenProps, otherProps] = splitProps(props, ['children'])
    createEffect(() =>
      store._setStore(mergeProps(defaultValue, otherProps) as any /* no need check type */),
    )
    return (
      <Context.Provider value={store as unknown as any /* noneed to check type here */}>
        {childrenProps.children}
      </Context.Provider>
    )
  }

  const useStore = () => useContext(Context) as unknown as Store<T> /* noneed to check type here */

  return [Provider, useStore, _rawStore, onPropertyChange]
}
