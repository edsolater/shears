import { createOnStoreInitCallback } from '../../../../packages/pivkit'
import { getPairJson } from './mainThread'
import { PairsStore } from './store'

export const initPairJson = createOnStoreInitCallback<PairsStore>(
  ({ setPairsState, setIsPairsLoading, setAllPairJsonInfos, setStore }) => {
    setIsPairsLoading(true)
    getPairJson((allPairJsonInfos) => {
      setPairsState('loaded')
      setIsPairsLoading(false)
      allPairJsonInfos && setAllPairJsonInfos(allPairJsonInfos.slice(0,200))
      // let count = 0
      // const clonedAllPairJsonInfos = structuredClone(allPairJsonInfos)
      // const timeoutId = setInterval(() => {
      //   const newPairs = clonedAllPairJsonInfos?.slice(0, 8).map((i) => ({ ...i, name: i.name + count }))
      //   newPairs && setStore('allPairJsonInfos', reconcile(newPairs))
      //   count++
      // }, 1000)
      // return () => clearInterval(timeoutId)
    })
  }
)
