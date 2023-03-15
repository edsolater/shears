import { jFetch } from '../../../../../packages/jFetch'
import { FarmStore } from '../store'
import { FarmJSONInfo, FarmJSONFile } from '../type'

export async function fetchFarmJsonInfo(options: { url: string }): Promise<NonNullable<FarmStore['farmJsonInfos']>> {
  const result = await fetchFarmJsonFile(options)
  if (!result) return new Map()
  const stateInfos = result.stake.map((i) => ({ ...i, category: 'stake' })) as FarmJSONInfo[]
  const raydiumInfos = result.raydium.map((i) => ({ ...i, category: 'raydium' })) as FarmJSONInfo[]
  const fusionInfos = result.fusion.map((i) => ({ ...i, category: 'fusion' })) as FarmJSONInfo[]
  const ecosystemInfos = result.ecosystem.map((i) => ({ ...i, category: 'ecosystem' })) as FarmJSONInfo[]
  return new Map([
    ...stateInfos.map((i) => [i.id, i] as const),
    ...raydiumInfos.map((i) => [i.id, i] as const),
    ...fusionInfos.map((i) => [i.id, i] as const),
    ...ecosystemInfos.map((i) => [i.id, i] as const)
  ])
}

function fetchFarmJsonFile(options: { url: string }) {
  return jFetch<FarmJSONFile>(options.url, { cacheFreshTime: 5 * 60 * 1000 })
}
