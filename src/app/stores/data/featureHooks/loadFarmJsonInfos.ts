import { getMessageReceiver, getMessageSender } from '../../../utils/webworker/loadWorker_main'
import { farmJsonInfosAtom, isFarmJsonLoadingAtom } from '../atoms'

/** u can see which this hook related to by checking import */
export function loadFarmJsonInfos() {
  isFarmJsonLoadingAtom.set(true)
  const receiver = getFarmJsonFromWorker()
  receiver.subscribe((allFarmJsonInfos) => {
    isFarmJsonLoadingAtom.set(false)
    farmJsonInfosAtom.set(allFarmJsonInfos)
  })
}

export function getFarmJsonFromWorker() {
  const sender = getMessageSender('fetch raydium farms info')
  sender.query()

  const receiver = getMessageReceiver('fetch raydium farms info')
  return receiver
}
