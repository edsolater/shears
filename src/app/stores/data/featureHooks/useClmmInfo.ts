import { assert, gt, isExist, isPositive, lt, minus } from "@edsolater/fnkit"
import { useShuckValue } from "../../../../packages/conveyor/solidjsAdapter/useShuck"
import type { TxBuilderSingleConfig } from "../../../utils/txHandler/txDispatcher_main"
import { useWalletOwner } from "../../wallet/store"
import { shuck_balances, shuck_rpc, shuck_slippage, shuck_tokenPrices, shuck_tokens } from "../store"
import { useToken } from "../token/useToken"
import { useTokenPrice } from "../tokenPrice/useTokenPrice"
import type { ClmmInfo, ClmmUserPositionAccount } from "../types/clmm"
import {
  getClmmUserPositionAccountAdditionalInfo,
  type AdditionalClmmUserPositionAccount,
} from "./getClmmUserPositionAccountAdditionalInfo"
import { mergeTwoStore } from "./mergeTwoStore"

type AdditionalClmmInfo = {
  buildCustomizedFollowPositionTxConfigs():
    | {
        decreaseClmmPositionTxConfigs: TxBuilderSingleConfig[]
        increaseClmmPositionTxConfigs: TxBuilderSingleConfig[]
      }
    | undefined
}

export function useClmmInfo(clmmInfo: ClmmInfo): AdditionalClmmInfo & ClmmInfo {
  const pricesMap = useShuckValue(shuck_tokenPrices)
  const tokens = useShuckValue(shuck_tokens) // TODO let still invisiable unless actual use this value
  const rpc = useShuckValue(shuck_rpc)
  const owner = useWalletOwner()
  const slippage = useShuckValue(shuck_slippage)
  const balances = useShuckValue(shuck_balances)
  const tokenA = useToken(() => clmmInfo.base)
  const tokenB = useToken(() => clmmInfo.quote)
  const priceA = useTokenPrice(() => clmmInfo.base)
  const priceB = useTokenPrice(() => clmmInfo.quote)

  function getPositionInfo(position: ClmmUserPositionAccount) {
    return getClmmUserPositionAccountAdditionalInfo({
      clmmInfo,
      positionInfo: position,
      pricesMap,
      tokens,
      rpcUrl: () => rpc()?.url,
      owner: owner,
      slippage: slippage,
      balances: balances,
      tokenA: () => tokenA,
      tokenB: () => tokenB,
      priceA,
      priceB,
    })
  }

  return mergeTwoStore(clmmInfo, {
    buildCustomizedFollowPositionTxConfigs: () =>
      buildCustomizedFollowPositionTxConfigs({
        clmmInfo,
        getPositionInfo,
      }),
  })
}

function buildCustomizedFollowPositionTxConfigs({
  clmmInfo,
  getPositionInfo,
}: {
  clmmInfo: ClmmInfo
  getPositionInfo(position: ClmmUserPositionAccount): AdditionalClmmUserPositionAccount
}) {
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
      const richPosition = getPositionInfo(position)
      const originalUSD = richPosition.userLiquidityUSD()
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
      const richPosition = getPositionInfo(nearestUpPosition)
      const txBuilderConfig = richPosition.buildPositionShowHandTxConfig()
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
      const richPosition = getPositionInfo(position)
      const originalUSD = richPosition.userLiquidityUSD()
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
      const richPosition = getPositionInfo(nearestDownPosition)
      const txBuilderConfig = richPosition.buildPositionShowHandTxConfig()
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
