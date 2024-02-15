import { jFetch } from '../../../../packages/jFetch_new'
import { appApiUrls } from '../../../utils/common/config'
import { toCollectionObject } from '../../../utils/dataTransmit/itemMethods'
import { StoreData } from '../store'
import { type ClmmJsonFile, type ClmmJsonInfo } from '../types/clmm'

export async function fetchClmmJsonInfo(): Promise<StoreData['clmmJsonInfos']> {
  const clmmJsonFile = await jFetch<ClmmJsonFile>(appApiUrls.clmmPools, { cacheFreshTime: 5 * 60 * 1000 })
  if (!clmmJsonFile) return
  return toCollectionObject(clmmJsonFile.data as ClmmJsonInfo[], (i) => i.id) satisfies StoreData['clmmJsonInfos']
}
