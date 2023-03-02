import { jFetch } from '@edsolater/jfetch'
import { RaydiumTokenListJsonFile, TokenMessageData } from '../types/type'

export function fetchTokenJsonFile(options: { url: string }) {
  return jFetch<RaydiumTokenListJsonFile>(options.url, {
    cacheFreshTime: 5 * 60 * 1000
  })
}
export function handleRaydiumTokenJsonFile(res: RaydiumTokenListJsonFile): TokenMessageData {
  const tokens = [
    ...(res.official.map((t) => ({ ...t, is: 'raydium-official' } as const)) ?? []),
    ...(res.unOfficial.map((t) => ({ ...t, is: 'raydium-unofficial' } as const)) ?? []),
    ...(res.unNamed.map((t) => ({ ...t, is: 'raydium-unnamed' } as const)) ?? [])
  ]
  return { tokens, blacklist: res.blacklist }
}
