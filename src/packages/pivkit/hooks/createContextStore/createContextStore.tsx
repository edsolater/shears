import { createContext, createEffect, JSXElement, mergeProps, splitProps, useContext } from 'solid-js'
import { OnFirstAccessCallback, OnChangeCallback, Store } from './type'
import { createProxiedStore } from './core'

export function createContextStore<T extends Record<string, any>>(
  defaultValue?: T,
  options?: {
    name?: string
    onFirstAccess?: { propertyName: keyof T; cb: OnFirstAccessCallback<T, any> }[]
    onChange?: { propertyName: keyof T; cb: OnChangeCallback<T, keyof T> }[]
  }
): [
  Provider: (
    props: {
      children?: JSXElement
    } & Partial<T>
  ) => JSXElement,
  useStore: () => Store<T>
] {
  const proxiedStore = createProxiedStore(defaultValue, options)
  const Context = createContext(defaultValue ?? ({} as T), { name: options?.name })
  const Provider = (props: { children?: JSXElement } & Partial<T>) => {
    const [childrenProps, otherProps] = splitProps(props, ['children'])
    createEffect(() => proxiedStore.setStore(mergeProps(defaultValue, otherProps)))
    return (
      <Context.Provider value={proxiedStore as unknown as any /* noneed to check type here */}>
        {childrenProps.children}
      </Context.Provider>
    )
  }

  const useStore = () => useContext(Context) as unknown as Store<T> /* noneed to check type here */

  return [Provider, useStore]
}
