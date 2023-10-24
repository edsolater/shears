import { appApiUrls } from '../../../utils/common/config'
import { getMessagePort } from '../../../utils/webworker/loadWorker_main'
import { workerCommands } from '../../../utils/webworker/type'
import { setStore } from '../store'

export function loadTokens() {
  console.log('[main] start loading tokens')
  setStore({ isTokenListLoading: true })
  const { sender, receiver } = getMessagePort(workerCommands['fetch raydium supported tokens'])
  sender.query({ url: appApiUrls.tokenInfo })
  receiver.subscribe((allTokens) => {
    setStore({ isTokenListLoading: false, tokens: allTokens })
  })
}
