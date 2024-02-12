import { jFetch } from '../../../../packages/jFetch'
import { appApiUrls } from '../../../utils/common/config'
import { toCollectionObject } from '../../../utils/dataTransmit/itemMethods'
import { StoreData } from '../store'
import { type JsonClmmInfo, type JsonClmmFile } from '../types/clmm'

export async function fetchClmmJsonInfo(): Promise<StoreData['clmmJsonInfos']> {
  const clmmJsonFile = await jFetch<JsonClmmFile>(appApiUrls.clmmPools, { cacheFreshTime: 5 * 60 * 1000 })
  if (!clmmJsonFile) return
  return toCollectionObject(clmmJsonFile.data as JsonClmmInfo[], (i) => i.id) satisfies StoreData['clmmJsonInfos']
}
