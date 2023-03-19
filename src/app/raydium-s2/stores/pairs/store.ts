import { createEffect, createSignal, Setter } from 'solid-js'
import { createCachedGlobalHook } from '../../../../packages/pivkit'
import { loadData } from './methods/loadPairs'
import { JsonPairItemInfo } from './type'

export type PairsStore = {
  // for extract method
  $setters: {
    setIsLoading: Setter<boolean>
    setPairsInfos: Setter<JsonPairItemInfo[]>
  }
  readonly infos: JsonPairItemInfo[]
  readonly isLoading: boolean
  refetch(): void
}

export const usePairsStore = createCachedGlobalHook((): PairsStore => {
  const [isLoading, setIsLoading] = createSignal(false)
  const [pairsInfos, setPairsInfos] = createSignal<JsonPairItemInfo[]>([])
  createEffect(loadData)
  const store = {
    $setters: {
      setIsLoading,
      setPairsInfos
    },
    get infos() {
      return pairsInfos()
    },
    get isLoading() {
      return isLoading()
    },
    refetch: loadData
  }
  return store
})

