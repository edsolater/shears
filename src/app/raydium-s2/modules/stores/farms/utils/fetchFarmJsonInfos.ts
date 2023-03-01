import { jFetch } from '@edsolater/jfetch'
import { FarmPoolJsonInfo, FarmPoolsJsonFile } from '../types/type'

export async function fetchFarmJsonInfos(options: { apiUrl: string }): Promise<FarmPoolJsonInfo[] | undefined> {
  const result = await jFetch<FarmPoolsJsonFile>(options.apiUrl, { cacheFreshTime: 5 * 60 * 1000 })
  if (!result) return undefined
  return [
    ...(result.stake.map((i) => ({ ...i, category: 'stake' })) ?? []),
    ...(result.raydium.map((i) => ({ ...i, category: 'raydium' })) ?? []),
    ...(result.fusion.map((i) => ({ ...i, category: 'fusion' })) ?? []),
    ...(result.ecosystem.map((i) => ({ ...i, category: 'ecosystem' })) ?? [])
  ] as FarmPoolJsonInfo[]
}
