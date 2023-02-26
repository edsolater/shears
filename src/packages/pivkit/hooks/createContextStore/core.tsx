import { AnyFn, isFunction, isString, uncapitalize } from '@edsolater/fnkit';
import { createContext, createEffect, JSXElement, mergeProps, splitProps, useContext } from 'solid-js';
import { createStore } from 'solid-js/store';
import { OnFirstAccessCallback, OnChangeCallback, Store } from './type';

function toCallbackMap<F extends AnyFn>(pairs: { propertyName: string | number | symbol; cb: F; }[] = []) {
  const map = new Map<string, F[] | undefined>();
  pairs.forEach(({ propertyName, cb }) => {
    if (!isString(propertyName))
      throw new Error('propertyName must be string');
    const callbacks = map.get(propertyName) ?? [];
    callbacks.push(cb);
    map.set(propertyName, callbacks);
  });
  return map;
}
/** proxy with additional set* and onChange* methods */

export function createContextStore<T extends Record<string, any>>(
  defaultValue?: T,
  options?: {
    name?: string;
    onFirstAccess?: { propertyName: keyof T; cb: OnFirstAccessCallback<T, any>; }[];
    onChange?: { propertyName: keyof T; cb: OnChangeCallback<T, keyof T>; }[];
  }
): [
    Provider: (
      props: {
        children?: JSXElement;
      } & Partial<T>
    ) => JSXElement,
    useStore: () => Store<T>
  ] {
  const Context = createContext(defaultValue ?? ({} as T), { name: options?.name });

  const onFirstAccessCallbackMap = new Map(toCallbackMap(options?.onFirstAccess));
  const onChangeCallbackMap = new Map(toCallbackMap(options?.onChange));

  function invokeOnInitGets(propertyName: string, value: any, store: Store<T>) {
    onFirstAccessCallbackMap.get(propertyName)?.forEach((cb) => {
      cb(value, store);
    });
    onFirstAccessCallbackMap.delete(propertyName); // it's init, so sould delete eventually
  }
  function invokeOnChanges(propertyName: string, newValue: any, prevValue: any, store: Store<T>) {
    onChangeCallbackMap.get(propertyName)?.forEach((cb) => {
      cb(newValue, prevValue, store);
    });
  }

  const [rawStore, setRawStore] = createStore(defaultValue);
  const proxiedStore = new Proxy(rawStore, {
    // result contain keys info
    get: (target, p, receiver) => {
      const targetType = isString(p) && p.startsWith('set') ? 'setter' : 'getter';

      if (targetType === 'setter') {
        const propertyName = uncapitalize((p as string).slice('set'.length));
        return (dispatch: ((newValue: unknown, prevValue?: unknown) => unknown) | unknown) => {
          const prevValue = Reflect.get(target, propertyName, receiver);
          const newValue = isFunction(dispatch) ? dispatch(prevValue) : dispatch;
          if (prevValue === newValue)
            return; // no need to update store with the same value
          invokeOnChanges(propertyName, newValue, prevValue, proxiedStore);
          setRawStore({ [propertyName]: newValue });
          return newValue;
        };
      }

      if (targetType === 'getter') {
        return () => {
          const propertyName = p as string;
          const newValue = Reflect.get(target, propertyName, receiver);
          invokeOnInitGets(propertyName, newValue, proxiedStore);
          return newValue;
        };
      }
    }
  }) as Store<T>;

  const Provider = (props: { children?: JSXElement; } & Partial<T>) => {
    const [childrenProps, otherProps] = splitProps(props, ['children']);
    createEffect(() => setRawStore(mergeProps(defaultValue, otherProps)));
    return (
      <Context.Provider value={proxiedStore as unknown as any /* noneed to check type here */}>
        {childrenProps.children}
      </Context.Provider>
    );
  };

  const useStore = () => useContext(Context) as unknown as Store<T>; /* noneed to check type here */

  return [Provider, useStore];
}
