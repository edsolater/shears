import { createOnFirstAccess } from '../../../../packages/pivkit'
import { getMessagePort } from '../../../utils/webworker/loadWorker_main'
import { isPairInfoLoadingAtom, pairInfosAtom, setStore } from '../atoms'
import { DataStore } from '../store'

export const onAccessPairsInfos = createOnFirstAccess<DataStore>(['pairInfos'], (store) => {})

export function loadPairs() {
  console.log('[main] load pairs')
  setStore({ isPairInfoLoading: true })
  getPairJsonFromWorker().subscribe((allPairJsonInfos) => {
    console.log('get pools count', allPairJsonInfos.length)
    setStore({ isPairInfoLoading: false, pairInfos: allPairJsonInfos.slice(0, 150) })
    let count = 0
    const clonedAllPairJsonInfos = structuredClone(allPairJsonInfos)
    const timeoutId = setInterval(() => {
      const newPairs = clonedAllPairJsonInfos?.slice(0, 150).map((i) => ({ ...i, name: i.name + count }))
      if (newPairs) {
        console.log('get pools count', newPairs.length)
        setStore({ isPairInfoLoading: false, pairInfos: newPairs })
      }
      count++
    }, 1000)
    return () => clearInterval(timeoutId)
  })
}

function getPairJsonFromWorker() {
  const { sender, receiver } = getMessagePort('fetch raydium pairs info')
  sender.query({ force: false })
  return receiver
}
