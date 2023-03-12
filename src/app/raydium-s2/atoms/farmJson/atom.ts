import { createEffect, createSignal } from 'solid-js'
import { createCachedGlobalHook } from '../../../../packages/pivkit'
import { appApiUrls } from '../../utils/common/config'
import { FarmPoolJsonInfo, FetchFarmsJsonPayloads } from './type'
import { subscribeWebWorker, WebworkerSubscribeCallback } from '../../utils/webworker/mainThread_receiver'

export const useFarmJsonAtom = createCachedGlobalHook(() => {
  const [isLoading, setIsLoading] = createSignal(false)
  const [farmJsonInfos, setFarmJsonInfos] = createSignal<FarmPoolJsonInfo[]>([])
  function loadData() {
    setIsLoading(true)
    console.log('fetched in farm json Atrom')
    getFarmJsonFromWorker((allFarmJsonInfos) => {
      setIsLoading(false)
      allFarmJsonInfos && setFarmJsonInfos(allFarmJsonInfos)
    })
  }
  loadData()
  const atom = {
    get infos() {
      return farmJsonInfos()
    },
    get isLoading() {
      return isLoading()
    },
    refetch() {
      loadData()
    }
  }
  return atom
})

function getFarmJsonFromWorker(cb: WebworkerSubscribeCallback<FarmPoolJsonInfo[]>) {
  return subscribeWebWorker<FarmPoolJsonInfo[], FetchFarmsJsonPayloads>(
    {
      description: 'fetch raydium farms info',
      payload: { url: appApiUrls.farmInfo }
    },
    cb
  )
}
