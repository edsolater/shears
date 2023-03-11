import { createEffect, createSignal } from 'solid-js'
import { createGlobalHook } from '../../../../packages/pivkit'
import { getFarmJsonFromWorker } from './mainThread'
import { FarmPoolJsonInfo } from './type'

export const useFarmJsonAtom = createGlobalHook(() => {
  const [isLoading, setIsLoading] = createSignal(false)
  const [farmJsonInfos, setFarmJsonInfos] = createSignal<FarmPoolJsonInfo[]>([])
  function fetchAndLoad() {
    setIsLoading(true)
    getFarmJsonFromWorker((allFarmJsonInfos) => {
      setIsLoading(false)
      allFarmJsonInfos && setFarmJsonInfos(allFarmJsonInfos)
    })
  }
  fetchAndLoad()
  const atom = {
    get infos() {
      return farmJsonInfos()
    },
    get isLoading() {
      return isLoading()
    },
    refetch() {
      fetchAndLoad()
    }
  }
  return atom
})
