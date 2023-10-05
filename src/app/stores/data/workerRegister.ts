import { registMessageReceiver } from '../../utils/webworker/loadSDKWorker'
import { FetchFarmsJSONPayloads, CalculateSwapRouteInfosParams } from './types/farm'
import { fetchFarmJsonInfo } from './utils/fetchFarmJson'
import { composeFarmSYN } from './utils/composeFarmSYN'
import { FetchPairsOptions } from './types/pairs'
import { fetchPairJsonInfo } from './utils/fetchPairJson'
import { FetchRaydiumTokenListOptions } from './types/tokenList'
import { fetchTokenJsonFile } from './utils/fetchTokenJson'
import { FetchRaydiumTokenPriceOptions } from './types/tokenPrice'
import { fetchTokenPrices } from './utils/fetchTokenPrices'
import { calculateSwapRouteInfos_worker } from './utils/calculateSwapRouteInfos_worker'
import { txSwap_worker } from './utils/txSwap_worker'
import { createCleanUpFunctionBucket } from '../../../packages/pivkit'
import { SOLToken } from '../../utils/dataStructures/Token'

/**
 * register receiver functions in worker-side
 */
export function registInWorker() {
  calculateSwapRouteInfos_worker()
  txSwap_worker()

  registMessageReceiver<FetchFarmsJSONPayloads>('fetch raydium farms info', ({ resolve }) =>
    fetchFarmJsonInfo().then(resolve),
  )

  const storedCleanUpFunctions = createCleanUpFunctionBucket()
  registMessageReceiver<CalculateSwapRouteInfosParams>('get raydium farms syn infos', async ({ payload, resolve }) => {
    storedCleanUpFunctions.invokeStoredAndClear()
    const { abort, resultSubscribable } = composeFarmSYN(payload)
    resultSubscribable.subscribe(resolve)
    storedCleanUpFunctions.add(abort)
  })

  registMessageReceiver<FetchPairsOptions>('fetch raydium pairs info', ({ payload, resolve }) =>
    fetchPairJsonInfo().then(resolve),
  )

  // TODO: logic should not be here, it's not gao nei ju de
  registMessageReceiver<FetchRaydiumTokenListOptions>(
    'fetch raydium supported tokens',
    async ({ payload: options, resolve }) =>
      /* TODO: currently only mainnet raydium token list was supported*/
      fetchTokenJsonFile(options).then((res) => {
        const availableTokens = res?.tokens
          .filter((t) => !res?.blacklist.includes(t.mint) || t.name === 'Native Solana')
          .concat(SOLToken) // replace api mistakely add SOL
        availableTokens && resolve(availableTokens)
      }),
  )

  registMessageReceiver<FetchRaydiumTokenPriceOptions>(
    'get raydium token prices',
    async ({ payload: options, resolve }) =>
      fetchTokenPrices(options.tokens, options.url).then((res) => resolve({ prices: res })),
  )
}
