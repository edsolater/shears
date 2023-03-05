import { createOnFirstAccessCallback } from '@edsolater/pivkit'
import { reconcile } from 'solid-js/store'
import { queryPairJson } from './mainThread'
import { PairsStore } from './store'

export const initAllPairs = createOnFirstAccessCallback<PairsStore>(
  'allPairJsonInfos',
  async ({ setPairsState, setIsPairsLoading, setAllPairJsonInfos, setStore }) => {
    setIsPairsLoading(true)
    queryPairJson((allPairJsonInfos) => {
      setPairsState('loaded')
      setIsPairsLoading(false)
      allPairJsonInfos && setAllPairJsonInfos(allPairJsonInfos.slice(0, 8))
      let count = 0
      const clonedAllPairJsonInfos = structuredClone(allPairJsonInfos)
      const timeoutId = setInterval(() => {
        const newPairs = clonedAllPairJsonInfos?.slice(0, 8).map((i) => ({ ...i, name: i.name + count }))
        newPairs && setStore('allPairJsonInfos', reconcile(newPairs))
        count++
      }, 1000)
      return () => clearInterval(timeoutId)
    })
  }
)
