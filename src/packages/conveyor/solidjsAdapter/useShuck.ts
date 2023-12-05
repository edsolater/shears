import { Accessor, Setter, createSignal, onCleanup, onMount } from 'solid-js'
import { Shuck, hideShuck, visualizeShuck } from '../smartStore/shuck'

let globalBranchNodeSignalID = 1
export function useShuck<T>(shuck: Shuck<T>): [Accessor<T>, Setter<T>] {
  // TODO: if multi has subscribed this shuck, shuck's visiable should depends on multi of them
  const innerID = globalBranchNodeSignalID++

  const [accessor, set] = createSignal(shuck())

  onMount(() => {
    visualizeShuck(shuck, innerID)
    onCleanup(() => {
      hideShuck(shuck, innerID)
    })
  })

  shuck.subscribe(set)

  return [accessor, set]
}
