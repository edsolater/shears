import type { PublicKey } from '../../../utils/dataStructures/type'
import type { APIClmmInfo, ClmmInfo, SDKClmmInfo } from '../types/clmm'

export async function composeClmmInfo(
  apiInfo: Record<PublicKey, APIClmmInfo>,
  sdkInfo: Record<PublicKey, SDKClmmInfo>,
): Promise<Record<string, ClmmInfo>> {
  return {} as any
}
