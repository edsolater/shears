/****
 *
 * default solidjs's {@link createContext} is readonly
 * {@link createComponentContext} hook is used to create a context with set() , so user can change context value
 *
 ***/

import { AnyObj, mergeObjects, shrinkFn } from '@edsolater/fnkit'
import { Context, JSXElement, createContext, untrack, useContext } from 'solid-js'
import { createStore } from 'solid-js/store'
import { createStoreSetter } from './smartStore/utils/setStoreByObject'

type ComponentContext<O extends AnyObj> = Context<O>

type ComponentContextSetter<O extends AnyObj> = (dispatch: ((prevValue?: O) => Partial<O>) | Partial<O>) => void

const contextSetter = Symbol('contextSetter')

/**
 * default solidjs's createContext is readonly
 * {@link createComponentContext} hook is used to create a context with set() , so user can change context value
 */
export function createComponentContext<O extends AnyObj>(): ComponentContext<O> {
  const BuildInContext = createContext({} as O)
  const ContextProvider = (props: { value: O; children?: JSXElement }) => {
    const [contextValue, setContextValue] = createStore(props.value)
    const setContext: ComponentContextSetter<O> = (dispatch) => {
      const prevStore = untrack(() => contextValue)
      const newStorePieces = shrinkFn(dispatch, [prevStore])
      if (!newStorePieces) return // no need to update store with the same value
      setContextValue(createStoreSetter(newStorePieces))
    }
    return (
      <BuildInContext.Provider value={mergeObjects(contextValue, { [contextSetter]: setContext })}>
        {props.children}
      </BuildInContext.Provider>
    )
  }
  const componentContext = mergeObjects([
    BuildInContext,
    { Provider: ContextProvider },
  ]) as unknown as ComponentContext<O>
  return componentContext
}

/**
 * {@link useContext} with set() method
 */
export function useComponentContext<O extends AnyObj>(
  context: ComponentContext<O>,
): [contextValue: O, setContext: ComponentContextSetter<O>] {
  const contextValue = useContext(context)
  const setContext = contextValue[contextSetter]
  return [contextValue, setContext]
}
