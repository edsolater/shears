import { registMessageReceiver } from '../../utils/webworker/worker_sdk'
import { FetchFarmsJSONPayloads, FetchFarmsSYNInfoPayloads } from './farmType'
import { fetchFarmJsonInfo } from './utils/fetchFarmJson'
import { composeFarmSYN } from './utils/composeFarmSYN'
import { FetchPairsOptions } from './pairsType'
import { fetchPairJsonInfo } from './utils/fetchPairJson'
import { FetchRaydiumTokenListOptions } from './tokenListType'
import { fetchTokenJsonFile } from './utils/fetchTokenJson'
import { FetchRaydiumTokenPriceOptions } from './tokenPriceType'
import { fetchTokenPrices } from './utils/fetchTokenPrices'

export function registInWorker() {
  registMessageReceiver<FetchFarmsJSONPayloads>('fetch raydium farms info', ({ resolve }) =>
    fetchFarmJsonInfo().then(resolve)
  )

  registMessageReceiver<FetchFarmsSYNInfoPayloads>(
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
