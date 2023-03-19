import { jFetch } from '../../../../../packages/jFetch'
import { appApiUrls } from '../../../utils/common/config'
import { FarmStore } from '../store'
import { FarmJSON, FarmJSONFile } from '../type'

export async function fetchFarmJsonInfo(): Promise<NonNullable<FarmStore['farmJsonInfos']>> {
  const result = await fetchFarmJsonFile()
  if (!result) return new Map()
  const stateInfos = result.stake.map((i) => ({ ...i, category: 'stake' })) as FarmJSON[]
  const raydiumInfos = result.raydium.map((i) => ({ ...i, category: 'raydium' })) as FarmJSON[]
  const fusionInfos = result.fusion.map((i) => ({ ...i, category: 'fusion' })) as FarmJSON[]
  const ecosystemInfos = result.ecosystem.map((i) => ({ ...i, category: 'ecosystem' })) as FarmJSON[]
  return new Map([
    ...stateInfos.map((i) => [i.id, i] as const),
    ...raydiumInfos.map((i) => [i.id, i] as const),
    ...fusionInfos.map((i) => [i.id, i] as const),
    ...ecosystemInfos.map((i) => [i.id, i] as const)
  ])
}

function fetchFarmJsonFile() {
  return jFetch<FarmJSONFile>(appApiUrls.farmInfo, { cacheFreshTime: 5 * 60 * 1000 })
}
