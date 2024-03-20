import { assert, gt, isExist, isPositive, lt, minus } from "@edsolater/fnkit"
import { untrack } from "solid-js"
import type { TxBuilderSingleConfig } from "../../../utils/txHandler/txDispatcher_main"
import type { ClmmInfo, ClmmUserPositionAccount } from "../types/clmm"
import { mergeTwoStore } from "./mergeTwoStore"
import { useClmmUserPositionAccount } from "./useClmmUserPositionAccount"

type AdditionalClmmInfo = {
  buildCustomizedFollowPositionTxConfigs():
    | {
        decreaseClmmPositionTxConfigs: TxBuilderSingleConfig[]
        increaseClmmPositionTxConfigs: TxBuilderSingleConfig[]
      }
    | undefined
}

export function useClmmInfo(clmmInfo: ClmmInfo): AdditionalClmmInfo & ClmmInfo {
  return mergeTwoStore(clmmInfo, {
    buildCustomizedFollowPositionTxConfigs: () => buildCustomizedFollowPositionTxConfigs(clmmInfo),
  })
}

function buildCustomizedFollowPositionTxConfigs(clmmInfo: ClmmInfo) {
  const positions = clmmInfo.userPositionAccounts
  assert(positions && positions.length > 0, "no position to follow; the button shouldn't be clickable")
  const currentPrice = clmmInfo.currentPrice
  assert(isExist(currentPrice), "current price is not available")

  // ---------------- group position ----------------
  const currentPositions = [] as ClmmUserPositionAccount[]
  const upPositions = [] as ClmmUserPositionAccount[] // out of range
  const downPositions = [] as ClmmUserPositionAccount[] // out of range

  for (const position of positions ?? []) {
    const priceLower = position.priceLower
    const priceUpper = position.priceUpper

    const isUpperLessThanCurrentPrice = lt(currentPrice, priceUpper)
    const isLowerGreaterThanCurrentPrice = gt(currentPrice, priceLower)
    const isUpperGreaterThanCurrentPrice = !isUpperLessThanCurrentPrice
    const isLowerLessThanCurrentPrice = !isLowerGreaterThanCurrentPrice
    if (isUpperGreaterThanCurrentPrice && isLowerLessThanCurrentPrice) {
      currentPositions.push(position)
    }
    if (isLowerGreaterThanCurrentPrice) {
      upPositions.push(position)
    }
    if (isUpperLessThanCurrentPrice) {
      downPositions.push(position)
    }
  }

  const decreaseClmmPositionTxConfigs = [] as TxBuilderSingleConfig[]
  const increaseClmmPositionTxConfigs = [] as TxBuilderSingleConfig[]
  // ---------------- handle up positions ----------------
  if (upPositions.length > 1) {
    let nearestUpPosition = upPositions[0]
    for (const position of upPositions) {
      if (lt(position.priceLower, nearestUpPosition.priceLower)) {
        nearestUpPosition = position
      }
    }

    let haveMoveAction = false
    for (const position of upPositions.filter((p) => p !== nearestUpPosition)) {
      const richPosition = untrack(() => useClmmUserPositionAccount(clmmInfo, position))
      const originalUSD = richPosition.userLiquidityUSD
      const needMove = isPositive(originalUSD) && isPositive(minus(originalUSD, 10))
      if (needMove) {
        haveMoveAction = true
        const txBuilderConfig = richPosition.buildPositionSetTxConfig({ usd: 6 })
        if (txBuilderConfig) {
          decreaseClmmPositionTxConfigs.push(txBuilderConfig)
        }
      }
    }

    if (haveMoveAction) {
      const richPosition = untrack(() => useClmmUserPositionAccount(clmmInfo, nearestUpPosition))
      const txBuilderConfig = richPosition.buildPositionIncreaseAllWalletRestTxConfig()
      if (txBuilderConfig) {
        increaseClmmPositionTxConfigs.push(txBuilderConfig)
      }
    }
  }

  // ---------------- handle down positions ----------------
  if (downPositions.length > 1) {
    let nearestDownPosition = downPositions[0]
    for (const position of downPositions) {
      if (gt(position.priceUpper, nearestDownPosition.priceUpper)) {
        nearestDownPosition = position
      }
    }

    let haveMoveAction = false
    for (const position of downPositions.filter((p) => p !== nearestDownPosition)) {
      const richPosition = untrack(() => useClmmUserPositionAccount(clmmInfo, position))
      const originalUSD = richPosition.userLiquidityUSD
      const needMove = isPositive(originalUSD) && isPositive(minus(originalUSD, 10))
      if (needMove) {
        haveMoveAction = true
        const txBuilderConfig = richPosition.buildPositionSetTxConfig({ usd: 6 })
        if (txBuilderConfig) {
          decreaseClmmPositionTxConfigs.push(txBuilderConfig)
        }
      }
    }

    if (haveMoveAction) {
      const richPosition = untrack(() => useClmmUserPositionAccount(clmmInfo, nearestDownPosition))
      const txBuilderConfig = richPosition.buildPositionIncreaseAllWalletRestTxConfig()
      if (txBuilderConfig) {
        increaseClmmPositionTxConfigs.push(txBuilderConfig)
      }
    }

    return {
      decreaseClmmPositionTxConfigs,
      increaseClmmPositionTxConfigs,
    }
  }

  // ---------------- handle tasks (send tx) ----------------
}
