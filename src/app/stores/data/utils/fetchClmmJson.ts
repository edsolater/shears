import { jFetch } from '../../../../packages/jFetch'
import { appApiUrls } from '../../../utils/common/config'
import { toCollectionObject } from '../../../utils/dataTransmit/itemMethods'
import { StoreData } from '../store'
import { type ClmmJSON, type ClmmJSONFile } from '../types/clmm'

export async function fetchClmmJsonInfo(): Promise<StoreData['clmmJsonInfos']> {
  const clmmJsonFile = await jFetch<ClmmJSONFile>(appApiUrls.clmmPools, { cacheFreshTime: 5 * 60 * 1000 })
  if (!clmmJsonFile) return
  return toCollectionObject(clmmJsonFile.data as ClmmJSON[], (i) => i.id) satisfies StoreData['clmmJsonInfos']
}
