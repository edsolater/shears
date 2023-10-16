import { getMessageReceiver, getMessageSender } from '../../../utils/webworker/loadWorker_main'
import { setStore } from '../dataStore'

/** u can see which this hook related to by checking import */
export function loadFarmJsonInfos() {
  setStore({ isFarmJsonLoading: true })
  const receiver = getFarmJsonFromWorker()
  receiver.subscribe((allFarmJsonInfos) => {
    setStore({ isFarmJsonLoading: false, farmJsonInfos: allFarmJsonInfos })
  })
}

export function getFarmJsonFromWorker() {
  const sender = getMessageSender('fetch raydium farms info')
  sender.query()

  const receiver = getMessageReceiver('fetch raydium farms info')
  return receiver
}
