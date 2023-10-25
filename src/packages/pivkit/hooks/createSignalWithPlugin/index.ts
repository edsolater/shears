import { shrinkFn } from '@edsolater/fnkit'
import { Accessor, Setter, createSignal } from 'solid-js'

type DefaultValuePluginCallback<V> = (originalDefaultValue: V | (() => V)) => void

type SignalController<V> = {
  addDefaultValueChanger: (cb: DefaultValuePluginCallback<V>) => void
  addSetWrapper: (cb: (originalSet: Setter<V>) => Setter<V>) => void
  addGetWrapper: (cb: (originalGet: Accessor<V>) => Accessor<V>) => void
}

type SignalPlugin<V> = (controller: SignalController<V>) => void

/**
 * basic util: plugin can get multi features
 */
// TODO: haven't test
export function createSignalWithPlugin2<V>(defaultValue: V | (() => V), options?: { plugins?: SignalPlugin<V>[], onDefaultValue?: (defaultValue: V | (() => V)) => void }) {
  const defaultSignalValueWrappers: ((getOriginalValue: () => V | Accessor<V>) => () => V | Accessor<V>)[] = []
  const setWrappers: ((originalSet: Setter<V>) => Setter<V>)[] = []
  const getWrappers: ((originalGet: Accessor<V>) => Accessor<V>)[] = []
  if (options?.plugins) {
    for (const plugin of options?.plugins) {
      const { defaultSignalValue, set, get } = plugin
      defaultSignalValue && defaultSignalValueWrappers.push(defaultSignalValue)
      set && setWrappers.push(set)
      get && getWrappers.push(get)
    }
  }
  const wrappedDefaultSignalValue = defaultSignalValueWrappers.reduce(
    (acc, wrapper) => wrapper(acc),
    () => defaultValue,
  )
  const [get, set] = createSignal<V>(shrinkFn(wrappedDefaultSignalValue()))
  const wrappedGet = getWrappers.reduce((acc, wrapper) => wrapper(acc), get)
  const wrappedSet = setWrappers.reduce((acc, wrapper) => wrapper(acc), set)
  return [wrappedGet, wrappedSet] as const
}
/**
 * basic util: plugin can get multi features
 */
// TODO: haven't test
export function createSignalWithPlugin<V>(defaultValue: V | (() => V), options?: { plugins?: SignalPlugin<V>[] }) {
  const defaultSignalValueWrappers: ((getOriginalValue: () => V | Accessor<V>) => () => V | Accessor<V>)[] = []
  const setWrappers: ((originalSet: Setter<V>) => Setter<V>)[] = []
  const getWrappers: ((originalGet: Accessor<V>) => Accessor<V>)[] = []
  if (options?.plugins) {
    for (const plugin of options?.plugins) {
      const { defaultSignalValue, set, get } = plugin
      defaultSignalValue && defaultSignalValueWrappers.push(defaultSignalValue)
      set && setWrappers.push(set)
      get && getWrappers.push(get)
    }
  }
  const wrappedDefaultSignalValue = defaultSignalValueWrappers.reduce(
    (acc, wrapper) => wrapper(acc),
    () => defaultValue,
  )
  const [get, set] = createSignal<V>(shrinkFn(wrappedDefaultSignalValue()))
  const wrappedGet = getWrappers.reduce((acc, wrapper) => wrapper(acc), get)
  const wrappedSet = setWrappers.reduce((acc, wrapper) => wrapper(acc), set)
  return [wrappedGet, wrappedSet] as const
}
