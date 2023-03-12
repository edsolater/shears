import { jFetch } from '../../../../../packages/jFetch'
import { RaydiumTokenListJsonFile, Token, TokenWorkerData } from '../type'

/**
 * used in webworker
 */
export async function fetchTokenJsonFile(options: { url: string }) {
  const res = await jFetch<RaydiumTokenListJsonFile>(options.url, {
    cacheFreshTime: 5 * 60 * 1000
  })
  return res && handleRaydiumTokenJsonFile(res)
}

function handleRaydiumTokenJsonFile(res: RaydiumTokenListJsonFile): TokenWorkerData {
  const tokens = [
    ...((res.official.map((t) => [t.mint, { ...t, is: 'raydium-official' }]) ?? []) as [string, Token][]),
    ...((res.unOfficial.map((t) => [t.mint, { ...t, is: 'raydium-unofficial' }]) ?? []) as [string, Token][]),
    ...((res.unNamed.map((t) => [t.mint, { ...t, is: 'raydium-unnamed' }]) ?? []) as [string, Token][])
  ]
  return { tokens: new Map(tokens), blacklist: res.blacklist }
}
