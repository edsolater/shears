import { assert, gt, isExist, isPositive, lt, minus, type Numberish } from "@edsolater/fnkit"
import { useShuckValue } from "../../../../packages/conveyor/solidjsAdapter/useShuck"
import type { TxBuilderSingleConfig } from "../../../utils/txHandler/txDispatcher_main"
import { shuck_balances, shuck_owner, shuck_rpc, shuck_slippage, shuck_tokenPrices, shuck_tokens } from "../store"
import { useToken } from "../token/useToken"
import { useTokenPrice } from "../tokenPrice/useTokenPrice"
import type { ClmmInfo, ClmmUserPositionAccount } from "../types/clmm"
import {
  getClmmUserPositionAccountAdditionalInfo,
  type AdditionalClmmUserPositionAccount,
} from "./getClmmUserPositionAccountAdditionalInfo"
import { mergeTwoStore } from "./mergeTwoStore"

type AdditionalClmmInfo = {
  buildCustomizedFollowPositionTxConfigs(options?: { ignoreWhenUsdLessThan?: number }): {
    decreaseClmmPositionTxConfigs: TxBuilderSingleConfig[]
    increaseClmmPositionTxConfigs: TxBuilderSingleConfig[]
  }
}

export function useClmmInfo(clmmInfo: ClmmInfo): AdditionalClmmInfo & ClmmInfo {
  const pricesMap = useShuckValue(shuck_tokenPrices)
  const tokens = useShuckValue(shuck_tokens) // TODO let still invisiable unless actual use this value
  const rpc = useShuckValue(shuck_rpc)
  const owner = useShuckValue(shuck_owner)
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
      owner,
      slippage,
      balances,
      tokenA: () => tokenA,
      tokenB: () => tokenB,
      priceA,
      priceB,
    })
  }

  const additional: {
    buildCustomizedFollowPositionTxConfigs: (options: any) => {
      decreaseClmmPositionTxConfigs: TxBuilderSingleConfig[]
      increaseClmmPositionTxConfigs: TxBuilderSingleConfig[]
    }
  } = {
    buildCustomizedFollowPositionTxConfigs: (options) =>
      buildCustomizedFollowPositionTxConfigs({
        clmmInfo,
        getPositionInfo,
        config: {
          ignoredPositionUsd: options?.ignoreWhenUsdLessThan ?? 5,
        },
      }),
  } as AdditionalClmmInfo
  return mergeTwoStore(clmmInfo, additional)
}

function buildCustomizedFollowPositionTxConfigs({
  clmmInfo,
  getPositionInfo,
  config,
}: {
  clmmInfo: ClmmInfo
  getPositionInfo(position: ClmmUserPositionAccount): AdditionalClmmUserPositionAccount
  config: {
    ignoredPositionUsd: number
  }
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
      const needMove = isPositive(originalUSD) && isPositive(minus(originalUSD, config.ignoredPositionUsd * 1.2))
      if (needMove) {
        haveMoveAction = true
        const txBuilderConfig = richPosition.buildPositionSetTxConfig({ usd: config.ignoredPositionUsd })
        if (txBuilderConfig) {
          decreaseClmmPositionTxConfigs.push(txBuilderConfig)
        }
      }
    }

    // show hand
    const richPosition = getPositionInfo(nearestUpPosition)
    const txBuilderConfig = richPosition.buildPositionShowHandTxConfig()
    if (txBuilderConfig) {
      increaseClmmPositionTxConfigs.push(txBuilderConfig)
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
      const needMove = isPositive(originalUSD) && isPositive(minus(originalUSD, config.ignoredPositionUsd * 1.2))
      if (needMove) {
        haveMoveAction = true
        const txBuilderConfig = richPosition.buildPositionSetTxConfig({ usd: config.ignoredPositionUsd })
        if (txBuilderConfig) {
          decreaseClmmPositionTxConfigs.push(txBuilderConfig)
        }
      }
    }

    // show hand
    const richPosition = getPositionInfo(nearestDownPosition)
    const txBuilderConfig = richPosition.buildPositionShowHandTxConfig()
    if (txBuilderConfig) {
      increaseClmmPositionTxConfigs.push(txBuilderConfig)
    }
  }

  // ---------------- handle tasks (send tx) ----------------
  return {
    decreaseClmmPositionTxConfigs,
    increaseClmmPositionTxConfigs,
  }
}
// /**
//  * different from {@link pipe}, this function give controller to each task, not prevValue
//  * and this function can't handle value change also. so if need handle value change, use {@link pipeDo} instead
//  */
// function pipeTasks(...tasks: ((controller: { next(): Promise<void> }) => void)[]) {
//   const initTaskAtom = Promise.resolve()
//   const controller = {
//     next: async () => {
//       for (const task of tasks) {
//         await new Promise<void>((resolve) => {
//           task({ next: resolve })
//         })
//       }
//     },
//   }
// }
