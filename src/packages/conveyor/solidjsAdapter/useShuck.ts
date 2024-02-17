import { Accessor, Setter, createSignal, onCleanup, onMount } from 'solid-js'
import { Shuck, makeShuckInvisiable, makeShuckVisiable } from '../smartStore/shuck'

let globalShuckInstanceSignalID = 1
export function useShuck<T>(shuck: Shuck<T>): [Accessor<T>, Setter<T>] {
  // TODO: if multi has subscribed this shuck, shuck's visiable should depends on multi of them
  const innerID = globalShuckInstanceSignalID++

  const [accessor, set] = createSignal(shuck())

  onMount(() => {
    makeShuckVisiable(shuck, innerID)
    onCleanup(() => {
      makeShuckInvisiable(shuck, innerID)
    })
  })

  shuck.subscribe(set)

  return [accessor, set]
}
