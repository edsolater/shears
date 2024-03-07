/**************************************************************************
 *
 * @tags CLMM utils
 *
 **************************************************************************/

import { find, get, map, toList } from "@edsolater/fnkit"
import type { ClmmInfos, ClmmUserPositionAccount } from "./types/clmm"

/**
 * clmmId => ClmmInfo
 */
export function getClmmInfo(clmmId: string, clmms: ClmmInfos) {
  return get(clmms, clmmId)
}

/**
 * nftMint => ClmmUserPositionAccount
 */
export function getClmmPosition(
  positionNftMint: string,
  clmms: ClmmInfos,
  options?: {
    /* with this will get all be faster */
    clmmId?: string
  },
): ClmmUserPositionAccount | undefined {
  const clmmId = options?.clmmId
  if (clmmId) {
    const clmm = getClmmInfo(clmmId, clmms)
    if (!clmm) return undefined
    const targetPosition = find(clmm.userPositionAccounts, (positionAccount) =>
      Boolean(positionAccount && positionAccount.nftMint === positionNftMint),
    )
    return targetPosition
  } else {
    const allPositionAccounts = map(toList(clmms), (clmm) => clmm.userPositionAccounts).flat()
    const targetPosition = find(allPositionAccounts, (positionAccount) =>
      Boolean(positionAccount && positionAccount.nftMint === positionNftMint),
    )
    return targetPosition
  }
}
