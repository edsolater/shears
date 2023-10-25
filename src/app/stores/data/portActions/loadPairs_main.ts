import { getMessagePort } from '../../../utils/webworker/loadWorker_main'
import { setStore } from '../store'

export function loadPairs() {
  console.log('[main] start loading pairs')
  setStore({ isPairInfoLoading: true })
  const { sender, receiver } = getMessagePort('fetch raydium pairs info')
  sender.query({ force: false })
  receiver.subscribe((allPairJsonInfos) => {
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
    }, 4000)
    return () => clearInterval(timeoutId)
  })
}