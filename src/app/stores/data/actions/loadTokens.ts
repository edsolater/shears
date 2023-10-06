import { createOnFirstAccess, Store } from '../../../../packages/pivkit'
import { appApiUrls } from '../../../utils/common/config'
import { getMessageReceiver, getMessageSender } from '../../../utils/webworker/loadWorker_main'
import { DataStore } from '../store'

export const onAccessTokens = createOnFirstAccess<DataStore>(['allTokens'], loadTokensInfos)

export function loadTokensInfos(store: Store<DataStore>) {
  store.set({ isTokenLoading: true })
  getTokenJsonInfoFromWorker().subscribe((allTokens) => {
    store.set({ isTokenLoading: false, allTokens: allTokens })
  })
}

export const getTokenJsonInfoFromWorker = () => {
  const sender = getMessageSender('fetch raydium supported tokens')
  sender.query({ url: appApiUrls.tokenInfo })
  const receiver = getMessageReceiver('fetch raydium supported tokens')
  return receiver
}
