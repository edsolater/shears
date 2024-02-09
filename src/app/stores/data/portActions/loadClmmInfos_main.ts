import { getMessagePort } from '../../../utils/webworker/loadWorker_main'
import { setStore } from '../store'

export function loadClmmInfos() {
  console.log('[main] start loading Clmm infos')
  setStore({ isPairInfoLoading: true })
  const { sender, receiver } = getMessagePort('fetch raydium Clmm infos')
  sender.query({ force: false })
  receiver.subscribe((allPairJsonInfos) => {
    setStore({ isPairInfoLoading: false, pairInfos: allPairJsonInfos.slice(0, 150) })
    let count = 0
    const clonedAllPairJsonInfos = structuredClone(allPairJsonInfos)
    const timeoutId = setInterval(() => {
      const newPairs = clonedAllPairJsonInfos?.slice(0, 150).map((i) => ({ ...i, name: i.name + count }))
      if (newPairs) {
        console.log('get pools count', clonedAllPairJsonInfos.length)
        setStore({ isPairInfoLoading: false, pairInfos: newPairs })
      }
      count++
    }, 4000)
    return () => clearInterval(timeoutId)
  })
}
