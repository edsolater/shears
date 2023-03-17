import { IndexAccessMap } from '../../../../packages/fnkit/customizedClasses/IndexAccessMap'
import { jFetch } from '../../../../packages/jFetch'
import { LiquidityJson, LiquidityJsonFile } from './liquidtyInfoType'

/**
 * <span style="color:blue">some *blue* text</span>.
 */
export async function fetchLiquidityJson(options: {
  url: string
}): Promise<IndexAccessMap<LiquidityJson, 'id'> | undefined> {
  const response = await jFetch<LiquidityJsonFile>(options.url, { cacheFreshTime: 5 * 60 * 1000 })
  if (!response) return undefined
  const liquidityInfoList = [...(response?.official ?? []), ...(response?.unOfficial ?? [])]
  return new IndexAccessMap<LiquidityJson, 'id'>('id', liquidityInfoList)
}
