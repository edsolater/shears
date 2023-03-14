import { jFetch } from '../../../../../packages/jFetch'
import { FarmJSONInfo, FarmJSONFile } from '../type'

export async function fetchFarmJsonInfo(options: { url: string }): Promise<FarmJSONInfo[] | undefined> {
  const result = await fetchFarmJsonFile(options)
  if (!result) return undefined
  return [
    ...(result.stake.map((i) => ({ ...i, category: 'stake' })) ?? []),
    ...(result.raydium.map((i) => ({ ...i, category: 'raydium' })) ?? []),
    ...(result.fusion.map((i) => ({ ...i, category: 'fusion' })) ?? []),
    ...(result.ecosystem.map((i) => ({ ...i, category: 'ecosystem' })) ?? [])
  ] as FarmJSONInfo[]
}

function fetchFarmJsonFile(options: { url: string }) {
  return jFetch<FarmJSONFile>(options.url, { cacheFreshTime: 5 * 60 * 1000 })
}
