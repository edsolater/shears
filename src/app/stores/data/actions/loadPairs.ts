import { createOnFirstAccess, Store } from '../../../../packages/pivkit'
import { getMessageReceiver, getMessageSender } from '../../../utils/webworker/loadWorker_main'
import { DataStore } from '../store'

export const onAccessPairsInfos = createOnFirstAccess<DataStore>(['pairInfos'], (store) => {
  loadPairs(store)
})

export function loadPairs(store: Store<DataStore>) {
  store.set({ isPairInfoLoading: true })
  getPairJsonFromWorker().subscribe((allPairJsonInfos) => {
    console.log('get pools count', allPairJsonInfos.length)
    store.set({ isPairInfoLoading: false, pairInfos: allPairJsonInfos.slice(0, 150) })
    let count = 0
    const clonedAllPairJsonInfos = structuredClone(allPairJsonInfos)
    const timeoutId = setInterval(() => {
      const newPairs = clonedAllPairJsonInfos?.slice(0, 150).map((i) => ({ ...i, name: i.name + count }))
      newPairs && store.set({ isPairInfoLoading: false, pairInfos: newPairs })
      count++
    }, 1000)
    return () => clearInterval(timeoutId)
  })
}

function getPairJsonFromWorker() {
  const sender = getMessageSender('fetch raydium pairs info')
  sender.query({
    force: false,
  })

  const receiver = getMessageReceiver('fetch raydium pairs info')
  return receiver
}
