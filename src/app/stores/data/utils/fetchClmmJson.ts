import { jFetch } from '../../../../packages/jFetch'
import { appApiUrls } from '../../../utils/common/config'
import { toRecord } from '@edsolater/fnkit'
import type { StoreData } from '../store'
import { type ClmmJsonFile, type ClmmJsonInfo } from '../types/clmm'

export async function fetchClmmJsonInfo(): Promise<StoreData['clmmJsonInfos']> {
  const clmmJsonFile = await jFetch<ClmmJsonFile>(appApiUrls.clmmPools, { cacheFreshTime: 5 * 60 * 1000 })
  if (!clmmJsonFile) return
  return toRecord(clmmJsonFile.data as ClmmJsonInfo[], (i) => i.id) satisfies StoreData['clmmJsonInfos']
}
