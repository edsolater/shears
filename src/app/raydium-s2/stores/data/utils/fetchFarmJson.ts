import { IndexAccessList } from '../../../../../packages/fnkit/customizedClasses/IndexAccessList'
import { jFetch } from '../../../../../packages/jFetch'
import { appApiUrls } from '../../../utils/common/config'
import { DataStore } from '../store'
import { FarmJSON, FarmJSONFile } from '../farmType'

export async function fetchFarmJsonInfo(): Promise<DataStore['farmJsonInfos']> {
  const result = await fetchFarmJsonFile()
  if (!result) return
  const stateInfos = result.stake.map((i) => ({ ...i, category: 'stake' })) as FarmJSON[]
  const raydiumInfos = result.raydium.map((i) => ({ ...i, category: 'raydium' })) as FarmJSON[]
  const fusionInfos = result.fusion.map((i) => ({ ...i, category: 'fusion' })) as FarmJSON[]
  const ecosystemInfos = result.ecosystem.map((i) => ({ ...i, category: 'ecosystem' })) as FarmJSON[]
  return new IndexAccessList([...stateInfos, ...raydiumInfos, ...fusionInfos, ...ecosystemInfos], 'id')
}

function fetchFarmJsonFile() {
  return jFetch<FarmJSONFile>(appApiUrls.farmInfo, { cacheFreshTime: 5 * 60 * 1000 })
}
