import { appApiUrls } from '../../../utils/common/config'
import { getMessageReceiver, getMessageSender } from '../../../utils/webworker/loadWorker_main'
import { setStore } from '../dataStore'


export function loadTokensInfos() {
  setStore({ isTokenListLoading: true })
  getTokenJsonInfoFromWorker().subscribe((allTokens) => {
    setStore({ isTokenListLoading: false, tokens: allTokens })
  })
}

export const getTokenJsonInfoFromWorker = () => {
  const sender = getMessageSender('fetch raydium supported tokens')
  sender.query({ url: appApiUrls.tokenInfo })
  const receiver = getMessageReceiver('fetch raydium supported tokens')
  return receiver
}
