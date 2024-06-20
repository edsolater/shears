import {
  add,
  assert,
  eq,
  get,
  greaterThan,
  gt,
  isExist,
  isPositive,
  lt,
  minus,
  mul,
  toStringNumber,
  type Numberish,
} from "@edsolater/fnkit"
import { useShuckValue } from "../../../../packages/conveyor/solidjsAdapter/useShuck"
import type { TxBuilderSingleConfig } from "../../../utils/txHandler/txDispatcher_main"
import { mergeTwoStore } from "../featureHooks/mergeTwoStore"
import {
  shuck_balances,
  shuck_owner,
  shuck_rpc,
  shuck_slippage,
  shuck_tokenPrices,
  shuck_tokens,
  type Balances,
  type Prices,
} from "../store"
import { useToken } from "../token/useToken"
import { useTokenPrice } from "../tokenPrice/useTokenPrice"
import type { ClmmInfo, ClmmUserPositionAccount } from "../types/clmm"
import {
  calcPositionUserPositionLiquidityUSD,
  getClmmUserPositionAccountAdditionalInfo,
  type AdditionalClmmUserPositionAccount,
} from "./getClmmUserPositionAccountAdditionalInfo"
import type { Tokens } from "../token/type"
import { createEffect, type Accessor } from "solid-js"

type FollowPositionTxConfigs = {
  // upTokenMint: Mint | undefined
  // downTokenMint: Mint | undefined
  upDecreaseClmmPositionTxConfigs: TxBuilderSingleConfig[]
  downDecreaseClmmPositionTxConfigs: TxBuilderSingleConfig[]
  upShowHandTxConfigs: TxBuilderSingleConfig[]
  downShowHandTxConfigs: TxBuilderSingleConfig[]
  nextTaskSpeed: "quick" | "normal"
}

type AdditionalClmmInfo = {
  totalLiquidityUSD: Numberish | undefined
  buildTxFollowPositionTxConfigs(options?: { ignoreWhenUsdLessThan?: number }): FollowPositionTxConfigs
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
      clmmInfo: () => clmmInfo,
      positionInfo: () => position,
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

  const additional = {
    buildTxFollowPositionTxConfigs: (options) =>
      buildTxFollowPositionConfigs({
        clmmInfo,
        getPositionInfo,
        balances,
        config: {
          ignoredPositionUsd: options?.ignoreWhenUsdLessThan ?? 5,
        },
      }),
    totalLiquidityUSD: calcTotalClmmLiquidityUSD({ clmmInfo, tokens: tokens(), prices: pricesMap() })
      ?.totalLiquidityUSD,
  } as AdditionalClmmInfo
  return mergeTwoStore(clmmInfo, additional)
}

// TODO: convenient to  sign at once,but sign in different time
function buildTxFollowPositionConfigs({
  clmmInfo,
  getPositionInfo,
  balances,
  config,
}: {
  clmmInfo: ClmmInfo
  getPositionInfo(position: ClmmUserPositionAccount): AdditionalClmmUserPositionAccount
  balances: Accessor<Balances | undefined>
  config: {
    ignoredPositionUsd: number
  }
}): FollowPositionTxConfigs {
  const positions = clmmInfo.userPositionAccounts
  assert(positions && positions.length > 0, "no position to follow; the button shouldn't be clickable")
  const currentPrice = clmmInfo.currentPrice
  assert(isExist(currentPrice), "current price is not available")

  // ---------------- group position ----------------

  const currentPositions = [] as ClmmUserPositionAccount[]
  const priceBiggerPositions = [] as ClmmUserPositionAccount[] // out of range
  const priceLowerPositions = [] as ClmmUserPositionAccount[] // out of range

  const sortedPositions = positions?.toSorted((a, b) =>
    greaterThan(a.priceLower, b.priceLower) ? -1 : eq(a.priceLower, b.priceLower) ? 0 : 1,
  ) // original is already sorted, use this only for ensure the order
  for (const position of sortedPositions) {
    const priceLower = position.priceLower
    const priceUpper = position.priceUpper

    const isUpperLessThanCurrentPrice = lt(priceUpper, currentPrice)
    const isLowerGreaterThanCurrentPrice = gt(priceLower, currentPrice)
    const isUpperGreaterThanCurrentPrice = !isUpperLessThanCurrentPrice
    const isLowerLessThanCurrentPrice = !isLowerGreaterThanCurrentPrice
    if (isUpperGreaterThanCurrentPrice && isLowerLessThanCurrentPrice) {
      currentPositions.push(position)
    }
    if (isLowerGreaterThanCurrentPrice) {
      priceBiggerPositions.push(position)
    }
    if (isUpperLessThanCurrentPrice) {
      priceLowerPositions.push(position)
    }
  }

  // ---------------- handle positions ----------------

  const upTxConfigs = handlePositions({
    boundaryPositions: priceBiggerPositions,
    currentPosition: currentPositions[0],
    balanceA: balances()?.[clmmInfo.base],
    balanceB: balances()?.[clmmInfo.quote],
    direction: "priceBigger",
    currentPrice,
  })
  const downTxConfigs = handlePositions({
    boundaryPositions: priceLowerPositions,
    currentPosition: currentPositions[0],
    balanceA: balances()?.[clmmInfo.base],
    balanceB: balances()?.[clmmInfo.quote],
    direction: "priceLower",
    currentPrice,
  })

  return {
    upDecreaseClmmPositionTxConfigs: upTxConfigs.decreaseClmmPositionTxConfigs,
    downDecreaseClmmPositionTxConfigs: downTxConfigs.decreaseClmmPositionTxConfigs,
    upShowHandTxConfigs: upTxConfigs.showHandTxConfigs,
    downShowHandTxConfigs: downTxConfigs.showHandTxConfigs,
    nextTaskSpeed: upTxConfigs.needQuickRefresh || downTxConfigs.needQuickRefresh ? "quick" : "normal",
  }

  function handlePositions({
    boundaryPositions,
    currentPosition,
    balanceA,
    balanceB,
    direction,
    currentPrice,
  }: {
    boundaryPositions: ClmmUserPositionAccount[]
    currentPosition: ClmmUserPositionAccount
    direction: "priceBigger" | "priceLower"
    balanceA: Numberish | undefined
    balanceB: Numberish | undefined
    currentPrice: Numberish
  }) {
    const decreaseClmmPositionTxConfigs = [] as TxBuilderSingleConfig[]
    const showHandTxConfigs = [] as TxBuilderSingleConfig[]

    if (!boundaryPositions.length) return { showHandTxConfigs, decreaseClmmPositionTxConfigs }

    // ---------------- calc nearestPosition ----------------
    const nearestPosition = (() => {
      let nearestPosition = boundaryPositions[0]
      if (direction === "priceBigger") {
        for (const position of boundaryPositions) {
          if (lt(position.priceLower, nearestPosition.priceLower)) {
            nearestPosition = position
          }
        }
      } else {
        for (const position of boundaryPositions) {
          if (gt(position.priceUpper, nearestPosition.priceUpper)) {
            nearestPosition = position
          }
        }
      }
      return nearestPosition
    })()

    const hasBalance =
      direction === "priceBigger" ? gt(balanceA, config.ignoredPositionUsd) : gt(balanceB, config.ignoredPositionUsd)
    // currentPrice is bigger than turnPrice, means the price is going to change
    const turnPrice = add(
      currentPosition.priceLower,
      mul(direction === "priceBigger" ? 0.15 : 0.85, minus(currentPosition.priceUpper, currentPosition.priceLower)),
    )

    const hasAccrossTurnPrice = direction === "priceBigger" ? lt(currentPrice, turnPrice) : gt(currentPrice, turnPrice)
    const needQuickRefresh = hasAccrossTurnPrice && hasBalance
    const needShowHand = !hasAccrossTurnPrice

    // ---------------- decrease ----------------
    for (const position of needShowHand ? boundaryPositions.filter((p) => p !== nearestPosition) : boundaryPositions) {
      const richPosition = getPositionInfo(position)
      const originalUSD = richPosition.userLiquidityUSD()
      const needMove = isPositive(originalUSD) && isPositive(minus(originalUSD, config.ignoredPositionUsd * 1.2))
      if (needMove) {
        const txBuilderConfig = richPosition.buildPositionSetTxConfig({ usd: config.ignoredPositionUsd })
        if (txBuilderConfig) {
          decreaseClmmPositionTxConfigs.push(txBuilderConfig)
        }
      }
    }

    // ---------------- show hand ----------------
    if (needShowHand) {
      const richPosition = getPositionInfo(nearestPosition)
      const txBuilderConfig = richPosition.buildPositionShowHandTxConfig()
      if (txBuilderConfig) {
        showHandTxConfigs.push(txBuilderConfig)
      }
    }

    return { showHandTxConfigs, decreaseClmmPositionTxConfigs, needQuickRefresh }
  }
}

export function calcTotalClmmLiquidityUSD({
  clmmInfo,
  prices,
  tokens,
}: {
  clmmInfo: ClmmInfo
  prices: Prices | undefined
  tokens: Tokens | undefined
}) {
  if (!clmmInfo.userPositionAccounts) return {}
  const priceA = get(prices, clmmInfo.base)
  const priceB = get(prices, clmmInfo.quote)
  const tokenA = get(tokens, clmmInfo.base)
  const tokenB = get(tokens, clmmInfo.quote)
  if (!priceA || !priceB || !tokenA || !tokenB) return {}
  const totalLiquidityUSD = clmmInfo.userPositionAccounts.reduce((acc, position) => {
    const positionUSD = calcPositionUserPositionLiquidityUSD({
      tokenADecimals: tokenA?.decimals,
      tokenBDecimals: tokenB?.decimals,
      tokenAPrice: priceA,
      tokenBPrice: priceB,
      userPositionAccountAmountBN_A: position.amountBaseBN,
      userPositionAccountAmountBN_B: position.amountQuoteBN,
    })
    return positionUSD ? add(acc, positionUSD) : acc
  }, 0 as Numberish)

  return { totalLiquidityUSD }
}
