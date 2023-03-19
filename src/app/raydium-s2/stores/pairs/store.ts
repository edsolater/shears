import { createEffect, createSignal, Setter } from 'solid-js'
import { createCachedGlobalHook } from '../../../../packages/pivkit'
import { loadData } from './methods/loadPairs'
import { PairJson } from './type'

export type PairsStore = {
  // for extract method
  $setters: {
    setIsLoading: Setter<boolean>
    setPairsInfos: Setter<PairJson[]>
  }
  readonly infos: PairJson[]
  readonly isLoading: boolean
  refetch(): void
}

export const usePairsStore = createCachedGlobalHook((): PairsStore => {
  const [isLoading, setIsLoading] = createSignal(false)
  const [pairsInfos, setPairsInfos] = createSignal<PairJson[]>([])
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

