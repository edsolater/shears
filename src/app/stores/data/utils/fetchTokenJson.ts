import { jFetch } from '../../../../packages/jFetch'
import { RaydiumTokenListJsonFile, TokenWorkerData } from '../types/tokenList'
import { Token } from '../../../utils/dataStructures/Token'

/**
 * used in webworker
 */
export async function fetchTokenJsonFile(options: { url: string }) {
  const res = await jFetch<RaydiumTokenListJsonFile>(options.url, {
    cacheFreshTime: 5 * 60 * 1000,
  })
  return res && handleRaydiumTokenJsonFile(res)
}

function handleRaydiumTokenJsonFile(res: RaydiumTokenListJsonFile): TokenWorkerData {
  const tokens = [
    ...((res.official.map((t) => ({ ...t, is: 'raydium-official' })) ?? []) as Token[]),
    ...((res.unOfficial.map((t) => ({ ...t, is: 'raydium-unofficial' })) ?? []) as Token[]),
  ]
  return { tokens: tokens, blacklist: res.blacklist }
}
