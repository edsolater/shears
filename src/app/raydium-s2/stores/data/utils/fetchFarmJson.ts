import { jFetch } from '../../../../../packages/jFetch'
import { appApiUrls } from '../../../utils/common/config'
import { FarmJSON, FarmJSONFile } from '../types/farm'
import { DataStore } from '../store'

export async function fetchFarmJsonInfo(): Promise<DataStore['farmJsonInfos']> {
  const result = await fetchFarmJsonFile()
  if (!result) return
  const stateInfos = result.stake.map((i) => ({ ...i, category: 'stake' })) as FarmJSON[]
  const raydiumInfos = result.raydium.map((i) => ({ ...i, category: 'raydium' })) as FarmJSON[]
  const fusionInfos = result.fusion.map((i) => ({ ...i, category: 'fusion' })) as FarmJSON[]
  const ecosystemInfos = result.ecosystem.map((i) => ({ ...i, category: 'ecosystem' })) as FarmJSON[]
  return [...stateInfos, ...raydiumInfos, ...fusionInfos, ...ecosystemInfos]
}

function fetchFarmJsonFile() {
  return jFetch<FarmJSONFile>(appApiUrls.farmInfo, { cacheFreshTime: 5 * 60 * 1000 })
}
