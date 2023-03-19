import { IndexAccessMap } from '../../../../packages/fnkit/customizedClasses/IndexAccessMap'
import { jFetch } from '../../../../packages/jFetch'
import { appApiUrls } from '../../utils/common/config'
import { LiquidityJson, LiquidityJsonFile } from './liquidtyInfoType'

/**
 * <span style="color:blue">some *blue* text</span>.
 */
export async function fetchLiquidityJson(): Promise<IndexAccessMap<LiquidityJson, 'id'> | undefined> {
  const response = await jFetch<LiquidityJsonFile>(appApiUrls.poolInfo, { cacheFreshTime: 5 * 60 * 1000 })
  if (!response) return undefined
  const liquidityInfoList = [...(response?.official ?? []), ...(response?.unOfficial ?? [])]
  return new IndexAccessMap<LiquidityJson, 'id'>('id', liquidityInfoList)
}
