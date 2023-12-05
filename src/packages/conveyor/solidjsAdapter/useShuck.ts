import { createSignal, onCleanup, onMount } from 'solid-js'
import { Shuck, hideShuck, visualizeShuck } from '../smartStore/createShuck'

let globalBranchNodeSignalID = 1
export function useShuck<T>(shuck: Shuck<T>) {
  // TODO: if multi has subscribed this shuck, shuck's visiable should depends on multi of them
  const innerID = globalBranchNodeSignalID++

  const [accessor, set] = createSignal(shuck())

  onMount(() => {
    visualizeShuck(shuck)
    onCleanup(() => {
      hideShuck(shuck)
    })
  })

  shuck.subscribe(set)

  return [accessor, set]
}
