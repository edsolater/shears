import { createContext, createEffect, JSXElement, mergeProps, splitProps, useContext } from 'solid-js'
import { createProxiedStore, CreateProxiedStoreCallbacks } from './createProxiedStore'
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
  const [proxiedStore, rawStore, onPropertyChange] = createProxiedStore(defaultValue, options)
  const Context = createContext(defaultValue ?? ({} as T), { name: options?.name })
  const Provider = (props: { children?: JSXElement } & Partial<T>) => {
    const [childrenProps, otherProps] = splitProps(props, ['children'])
    createEffect(() =>
      proxiedStore._setStore(mergeProps(defaultValue?.(proxiedStore), otherProps) as any /* no need check type */),
    )
    return (
      <Context.Provider value={proxiedStore as unknown as any /* noneed to check type here */}>
        {childrenProps.children}
      </Context.Provider>
    )
  }

  const useStore = () => useContext(Context) as unknown as Store<T> /* noneed to check type here */

  return [Provider, useStore, rawStore, onPropertyChange]
}
