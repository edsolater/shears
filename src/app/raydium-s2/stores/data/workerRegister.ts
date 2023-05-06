import { registMessageReceiver } from '../../utils/webworker/worker_sdk'
import { FetchFarmsJSONPayloads, CalculateSwapRouteInfosParams } from './types/farm'
import { fetchFarmJsonInfo } from './utils/fetchFarmJson'
import { composeFarmSYN } from './utils/composeFarmSYN'
import { FetchPairsOptions } from './types/pairs'
import { fetchPairJsonInfo } from './utils/fetchPairJson'
import { FetchRaydiumTokenListOptions } from './types/tokenList'
import { fetchTokenJsonFile } from './utils/fetchTokenJson'
import { FetchRaydiumTokenPriceOptions } from './types/tokenPrice'
import { fetchTokenPrices } from './utils/fetchTokenPrices'
import { getWebworkerCalculateSwapRouteInfos_workerRegister } from './workerBridge/getWebworkerCalculateSwapRouteInfos_workerRegister'

export function registInWorker() {
  getWebworkerCalculateSwapRouteInfos_workerRegister()

  registMessageReceiver<FetchFarmsJSONPayloads>('fetch raydium farms info', ({ resolve }) =>
    fetchFarmJsonInfo().then(resolve)
  )

  registMessageReceiver<CalculateSwapRouteInfosParams>(
    'get raydium farms syn infos',
    async ({ payload, resolve, onClean }) => {
      const { abort, resultSubscribable } = composeFarmSYN(payload)
      resultSubscribable.subscribe(resolve)
      onClean(abort)
    }
  )

  registMessageReceiver<FetchPairsOptions>('fetch raydium pairs info', ({ payload, resolve }) =>
    fetchPairJsonInfo().then(resolve)
  )

  registMessageReceiver<FetchRaydiumTokenListOptions>(
    'fetch raydium supported tokens',
    async ({ payload: options, resolve }) =>
      /* TODO: currently only mainnet raydium token list was supported*/
      fetchTokenJsonFile(options).then((res) => {
        const availableTokens = res?.tokens.filter((t) => !res?.blacklist.includes(t.mint))
        availableTokens && resolve(availableTokens)
      })
  )

  registMessageReceiver<FetchRaydiumTokenPriceOptions>(
    'get raydium token prices',
    async ({ payload: options, resolve }) =>
      fetchTokenPrices(options.tokens, options.url).then((res) => resolve({ prices: res }))
  )
}
