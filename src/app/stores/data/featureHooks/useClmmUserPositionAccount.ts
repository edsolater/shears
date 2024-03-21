import {
  add,
  applyDecimal,
  assert,
  asyncMap,
  equal,
  get,
  gt,
  isExist,
  isPositive,
  lt,
  minus,
  mul,
  shakeNil,
  toFormattedNumber,
  type Numberish,
  isZero,
} from "@edsolater/fnkit"
import { createLazyMemo, usePromise } from "@edsolater/pivkit"
import { createEffect, createMemo, createSignal, on } from "solid-js"
import { createStore, reconcile } from "solid-js/store"
import { useShuckValue } from "../../../../packages/conveyor/solidjsAdapter/useShuck"
import { toTokenAmount, type Amount, type TokenAmount } from "../../../utils/dataStructures/TokenAmount"
import type { Price, USDVolume } from "../../../utils/dataStructures/type"
import type { TxHandlerEventCenter } from "../../../utils/txHandler"
import { invokeTxConfig } from "../../../utils/txHandler/txDispatcher_main"
import { useWalletOwner } from "../../wallet/store"
import { getEpochInfo } from "../connection/getEpochInfo"
import { getMultiMintInfos } from "../connection/getMultiMintInfos"
import { getTransferFeeInfo } from "../connection/getTransferFeeInfos"
import isCurrentToken2022 from "../isCurrentToken2022"
import {
  shuck_balances,
  shuck_rpc,
  shuck_slippage,
  shuck_tokenAccounts,
  shuck_tokenPrices,
  shuck_tokens,
  type Prices,
} from "../store"
import { useToken } from "../token/useToken"
import { useTokenPrice } from "../tokenPrice/useTokenPrice"
import type { TxClmmPositionDecreaseConfig } from "../txClmmPositionDecrease"
import type { TxClmmPositionIncreaseConfig } from "../txClmmPositionIncrease"
import type { ClmmInfo, ClmmUserPositionAccount } from "../types/clmm"
import type { Tokens } from "../token/type"

type AdditionalClmmUserPositionAccount = {
  rangeName: string
  inRange: boolean
  userLiquidityUSD: USDVolume | undefined
  pendingRewardAmountUSD: Numberish | undefined
  hasRewardTokenAmount: boolean
  isHarvestable: boolean
  txPositionIncrease: (params: TxClmmPositionIncreaseUIFnParams) => TxHandlerEventCenter
  txPositionDecrease: (params: TxClmmPositionDecreaseUIFnParams) => TxHandlerEventCenter
  txPositionSet: (params: TxClmmPositionSetToUIFnParams) => TxHandlerEventCenter | undefined
  txPositionIncreaseAllWalletRest: () => TxHandlerEventCenter | undefined
  buildPositionIncreaseTxConfig: (params: TxClmmPositionIncreaseUIFnParams) => TxClmmPositionIncreaseConfig
  buildPositionDecreaseTxConfig: (params: TxClmmPositionDecreaseUIFnParams) => TxClmmPositionDecreaseConfig
  buildPositionSetTxConfig: (
    params: TxClmmPositionSetToUIFnParams,
  ) => TxClmmPositionIncreaseConfig | TxClmmPositionDecreaseConfig | undefined
  buildPositionIncreaseAllWalletRestTxConfig: () => TxClmmPositionIncreaseConfig | undefined
}

/** for {@link AdditionalClmmUserPositionAccount}'s method txClmmPositionIncrease */
type TxClmmPositionIncreaseUIFnParams = { amountA: Amount } | { amountB: Amount }
/** for {@link AdditionalClmmUserPositionAccount}'s method txClmmPositionDecrease */
type TxClmmPositionDecreaseUIFnParams = { amountA: Amount } | { amountB: Amount }
type TxClmmPositionSetToUIFnParams = {
  usd: Amount
}
/**
 * hooks
 * hydrate {@link ClmmUserPositionAccount} to ui used data
 */
// TODO: should move inner to calcXXX() functions
export function useClmmUserPositionAccount(
  clmmInfo: ClmmInfo,
  positionInfo: ClmmUserPositionAccount,
): AdditionalClmmUserPositionAccount & ClmmUserPositionAccount {
  const pricesMap = useShuckValue(shuck_tokenPrices)
  const tokens = useShuckValue(shuck_tokens) // TODO let still invisiable unless actual use this value
  const rpcS = useShuckValue(shuck_rpc)
  const ownerS = useWalletOwner()
  const slippageS = useShuckValue(shuck_slippage)
  const balancesS = useShuckValue(shuck_balances)

  const tokenA = useToken(() => clmmInfo.base)
  const tokenB = useToken(() => clmmInfo.quote)
  const priceA = useTokenPrice(() => clmmInfo.base)
  const priceB = useTokenPrice(() => clmmInfo.quote)

  const userLiquidityUSD = () =>
    calcUserPositionLiquidityUSD({
      tokenAPrice: priceA(),
      tokenBPrice: priceB(),
      tokenADecimals: tokenA.decimals,
      tokenBDecimals: tokenB.decimals,
      userPositionAccountAmountBN_B: positionInfo.amountBaseBN,
      userPositionAccountAmountBN_A: positionInfo.amountQuoteBN,
    })

  const hasRewardTokenAmount = () =>
    positionInfo.rewardInfos.length > 0 && positionInfo.rewardInfos.some((info) => isPositive(info.penddingReward))
  const rangeName = () =>
    `${toFormattedNumber(positionInfo.priceLower, { decimals: 4 })}-${toFormattedNumber(positionInfo.priceUpper, { decimals: 4 })}`
  const inRange = () => calcPositionInRange({ clmmInfo, positionInfo })
  const rewardsAmountsWithFees = () =>
    calcPositionRewardsAmount({ clmmInfo, positionInfo, prices: pricesMap(), tokens: tokens() })
  const feesAmountsWithFees = () =>
    calcPositionfeesAmounts({ clmmInfo, positionInfo, prices: pricesMap(), tokens: tokens() })
  const hasFeeTokenAmount = () =>
    isPositive(positionInfo.tokenFeeAmountBase) || isPositive(positionInfo.tokenFeeAmountQuote)

  const pendingTotalWithFees = createLazyMemo(() =>
    rewardsAmountsWithFees()
      .concat(feesAmountsWithFees())
      .reduce(
        (acc, { tokenAmount, price }) => {
          if (!tokenAmount || !price) return acc
          return add(acc ?? 0, mul(tokenAmount.amount, price))
        },
        undefined as Numberish | undefined,
      ),
  )

  const pendingRewardAmountPromise = createMemo(
    on([rewardsAmountsWithFees, feesAmountsWithFees, rpcS, tokens], async () => {
      const rpcUrl = rpcS()?.url
      if (!rpcUrl) return undefined
      const mints = shakeNil(
        rewardsAmountsWithFees()
          .concat(feesAmountsWithFees())
          .map((i) => i.tokenAmount?.token.mint),
      )

      const [epochInfo, mintInfos] = mints.some((m) => !isCurrentToken2022(m, { tokens: tokens() }))
        ? []
        : await Promise.all([getEpochInfo({ rpcUrl: rpcUrl }), getMultiMintInfos(mints, { rpcUrl: rpcUrl })])

      const ams = await asyncMap(
        rewardsAmountsWithFees().concat(feesAmountsWithFees()),
        async ({ tokenAmount, ...rest }) => {
          if (!tokenAmount) return
          const feeInfo = await getTransferFeeInfo({
            rpcUrl: rpcUrl,
            tokens: tokens(),
            tokenAmount,
            fetchedEpochInfo: epochInfo,
            fetchedMints: mintInfos,
          })
          return { ...rest, tokenAmount: feeInfo?.pure }
        },
      )
      return shakeNil(ams).reduce(
        (acc, { tokenAmount, price }) => {
          if (!tokenAmount || !price) return acc
          return add(acc ?? 0, mul(tokenAmount.amount, price))
        },
        undefined as Numberish | undefined,
      )
    }),
  )
  const pendingRewardAmountUSD = usePromise(pendingRewardAmountPromise)

  const isHarvestable = createLazyMemo(() =>
    isPositive(pendingTotalWithFees()) || hasRewardTokenAmount() || hasFeeTokenAmount() ? true : false,
  )

  /** to txDispatcher("clmm position increase") */
  function txPositionIncrease(params: TxClmmPositionIncreaseUIFnParams) {
    return invokeTxConfig(buildTxClmmPositionIncreaseConfig(params))
  }

  function buildTxClmmPositionIncreaseConfig(params: TxClmmPositionIncreaseUIFnParams): TxClmmPositionIncreaseConfig {
    const rpcUrl = rpcS()?.url
    assert(rpcUrl, "for clmm position increase, rpc url not ready")
    const owner = ownerS()
    assert(owner, "for clmm position increase, owner not ready")
    const clmmId = clmmInfo.id
    const positionNftMint = positionInfo.nftMint
    const slippage = slippageS()
    return [
      "clmm position increase",
      {
        ...params,
        clmmId,
        positionNftMint,
        rpcUrl,
        owner,
        slippage,
      },
    ]
  }

  /** to txDispatcher("clmm position decrease") */
  function txPositionDecrease(params: TxClmmPositionDecreaseUIFnParams) {
    return invokeTxConfig(buildTxClmmPositionDecreaseConfig(params))
  }

  function buildTxClmmPositionDecreaseConfig(params: TxClmmPositionDecreaseUIFnParams): TxClmmPositionDecreaseConfig {
    const rpcUrl = rpcS()?.url
    assert(rpcUrl, "for clmm position decrease, rpc url not ready")
    const owner = ownerS()
    assert(owner, "for clmm position decrease, owner not ready")
    const clmmId = clmmInfo.id
    const positionNftMint = positionInfo.nftMint
    const slippage = slippageS()
    return [
      "clmm position decrease",
      {
        ...params,
        clmmId,
        positionNftMint,
        rpcUrl,
        owner,
        slippage,
      },
    ]
  }

  /** a shortcut of {@link txPositionDecrease} and {@link txPositionIncrease} */
  function txPositionSetUSD(params: TxClmmPositionSetToUIFnParams) {
    const txConfig = buildTxClmmPositionSetUSDConfig(params)
    if (txConfig) {
      return invokeTxConfig(txConfig)
    }
  }

  /** a shortcut of {@link txPositionDecrease} and {@link txPositionIncrease} */
  function buildTxClmmPositionSetUSDConfig(params: TxClmmPositionSetToUIFnParams) {
    const rpcUrl = rpcS()?.url
    assert(rpcUrl, "for clmm position decrease, rpc url not ready")
    const owner = ownerS()
    assert(owner, "for clmm position decrease, owner not ready")
    // const clmmId = clmmInfo.id
    // const positionNftMint = userPositionAccount.nftMint
    // const slippage = slippageS()
    const originalUSD = userLiquidityUSD()
    assert(originalUSD, "oops😅, origin usd is empty")
    if (equal(params.usd, originalUSD)) {
      console.warn(`seems no need to increase/decrease, liuidity is already $${toFormattedNumber(params.usd)} `)
      return
    } else if (lt(params.usd, originalUSD)) {
      const decreaseUSDAmount = minus(originalUSD, params.usd)
      if (gt(clmmInfo.currentPrice, positionInfo.priceUpper)) {
        //  amountSide "B"
        const price = priceB()
        assert(price, `price of ${tokenB.symbol} not ready`)
        const amount = mul(decreaseUSDAmount, price)
        return buildTxClmmPositionDecreaseConfig({ amountB: amount })
      } else if (lt(clmmInfo.currentPrice, positionInfo.priceLower)) {
        //  amountSide "A"
        const price = priceA()
        assert(price, `price of ${tokenA.symbol} not ready`)
        const amount = mul(decreaseUSDAmount, price)
        return buildTxClmmPositionDecreaseConfig({ amountA: amount })
      } else {
        throw new Error("//TEMPDEV currently not support in range decrease")
      }
    } else {
      const increaseUSDAmount = minus(params.usd, originalUSD)
      if (gt(clmmInfo.currentPrice, positionInfo.priceUpper)) {
        //  amountSide "B"
        const price = priceB()
        assert(price, `price of ${tokenB.symbol} not ready`)
        const amount = mul(increaseUSDAmount, price)
        return buildTxClmmPositionIncreaseConfig({ amountB: amount })
      } else if (lt(clmmInfo.currentPrice, positionInfo.priceLower)) {
        //  amountSide "A"
        const price = priceA()
        assert(price, `price of ${tokenA.symbol} not ready`)
        const amount = mul(increaseUSDAmount, price)
        return buildTxClmmPositionIncreaseConfig({ amountA: amount })
      } else {
        throw new Error("//TEMPDEV currently not support in range increase")
      }
    }
  }

  function getActionSide(): "A" | "B" {
    if (gt(clmmInfo.currentPrice, positionInfo.priceUpper)) {
      return "B"
    } else {
      return "A"
    }
  }

  /**
   * @todo TEMPDEV currently only support increase out of range position
   */
  function txPositionIncreaseAllWalletRest() {
    const txConfig = buildPositionIncreaseAllWalletRestConfig()
    if (!txConfig) return
    return invokeTxConfig(txConfig)
  }
  function buildPositionIncreaseAllWalletRestConfig() {
    const side = getActionSide()
    const balances = balancesS()
    const balanceOfTargetSideRawBN = get(balances, side === "A" ? clmmInfo.base : clmmInfo.quote)
    if (!balanceOfTargetSideRawBN || isZero(balanceOfTargetSideRawBN)) {
      console.warn(`seems no need to increase, ${side} balance is empty`)
      return
    }
    const balanceOfTargetSide = isExist(balanceOfTargetSideRawBN)
      ? toTokenAmount(side === "A" ? tokenA : tokenB, balanceOfTargetSideRawBN, { amountIsBN: true })
      : undefined
    assert(balanceOfTargetSide, "balance of target side not exist")
    return buildTxClmmPositionIncreaseConfig(
      side === "A" ? { amountA: balanceOfTargetSide.amount } : { amountB: balanceOfTargetSide.amount },
    )
  }

  const [userPositionAccountStore, setUserPositionStore] = createStore(
    positionInfo as AdditionalClmmUserPositionAccount & ClmmUserPositionAccount,
  )
  // 🤔 really need this? is this really work?
  createEffect(
    on(
      () => positionInfo,
      () => {
        //@ts-expect-error no need to check
        setUserPositionStore(reconcile(positionInfo))
      },
    ),
  )
  createEffect(() => setUserPositionStore({ rangeName: rangeName() }))
  createEffect(() => setUserPositionStore({ inRange: inRange() }))
  createEffect(() => setUserPositionStore({ userLiquidityUSD: userLiquidityUSD() }))
  createEffect(() => setUserPositionStore({ pendingRewardAmountUSD: pendingRewardAmountUSD() }))
  createEffect(() => setUserPositionStore({ hasRewardTokenAmount: hasRewardTokenAmount() }))
  createEffect(() => setUserPositionStore({ isHarvestable: isHarvestable() }))
  createEffect(() =>
    setUserPositionStore({
      txPositionIncrease: txPositionIncrease,
      txPositionDecrease: txPositionDecrease,
      txPositionSet: txPositionSetUSD,
      txPositionIncreaseAllWalletRest: txPositionIncreaseAllWalletRest,
      buildPositionIncreaseTxConfig: buildTxClmmPositionIncreaseConfig,
      buildPositionDecreaseTxConfig: buildTxClmmPositionDecreaseConfig,
      buildPositionSetTxConfig: buildTxClmmPositionSetUSDConfig,
      buildPositionIncreaseAllWalletRestTxConfig: buildPositionIncreaseAllWalletRestConfig,
    }),
  )

  return userPositionAccountStore
}

/** gen a checker to export ClmmUserPositionAccount */
//TODO: complete it!!!
export function useClmmUserPositionAccountChecker(options: {
  clmmInfo: ClmmInfo
}): (innerOptions: {
  positionInfo: ClmmUserPositionAccount
}) => AdditionalClmmUserPositionAccount & ClmmUserPositionAccount {
  return (innerOptions) => useClmmUserPositionAccount(options.clmmInfo, innerOptions.positionInfo)
}

function calcUserPositionLiquidityUSD(options: {
  tokenADecimals: number
  tokenBDecimals: number
  tokenAPrice: Price | undefined
  tokenBPrice: Price | undefined
  userPositionAccountAmountBN_A: Numberish | undefined
  userPositionAccountAmountBN_B: Numberish | undefined
}) {
  const tokenAPrices = options.tokenAPrice
  const tokenBPrices = options.tokenBPrice
  if (!tokenAPrices || !tokenBPrices) return undefined
  const tokenADecimal = options.tokenADecimals
  const tokenBDecimal = options.tokenBDecimals
  const amountABN = options.userPositionAccountAmountBN_B
  const amountBBN = options.userPositionAccountAmountBN_A
  if (amountABN === undefined || amountBBN === undefined) return undefined
  const amountA = applyDecimal(amountABN, tokenADecimal)
  const amountB = applyDecimal(amountBBN, tokenBDecimal)
  const wholeLiquidity = add(mul(amountA, tokenAPrices), mul(amountB, tokenBPrices))
  return wholeLiquidity
}

function calcPositionInRange(options: { clmmInfo: ClmmInfo; positionInfo: ClmmUserPositionAccount }) {
  return (
    gt(options.clmmInfo.currentPrice, options.positionInfo.priceLower) &&
    lt(options.clmmInfo.currentPrice, options.positionInfo.priceUpper)
  )
}

function calcPositionRewardsAmount(options: {
  clmmInfo: ClmmInfo
  positionInfo: ClmmUserPositionAccount
  prices: Prices | undefined
  tokens: Tokens
}) {
  return (
    options.positionInfo?.rewardInfos.map((info) => {
      const price = info.token && options.prices?.get(info.token)

      const t = info.token ? get(options.tokens, info.token) : undefined
      return {
        tokenAmount: t && info.penddingReward ? toTokenAmount(t, info.penddingReward, { amountIsBN: true }) : undefined,
        price: price,
      }
    }) ?? []
  )
}

function calcPositionfeesAmounts(options: {
  clmmInfo: ClmmInfo
  positionInfo: ClmmUserPositionAccount
  prices: Prices | undefined
  tokens: Tokens
}) {
  const t1 = options.positionInfo.tokenBase ? get(options.tokens, options.positionInfo.tokenBase) : undefined
  const t2 = options.positionInfo.tokenQuote ? get(options.tokens, options.positionInfo.tokenQuote) : undefined
  return options.positionInfo
    ? [
        {
          tokenAmount:
            t1 && options.positionInfo.tokenFeeAmountBase
              ? toTokenAmount(t1, options.positionInfo.tokenFeeAmountBase, { amountIsBN: true })
              : undefined,
          price: options.positionInfo.tokenBase && options.prices?.get(options.positionInfo.tokenBase),
        },
        {
          tokenAmount:
            t2 && options.positionInfo.tokenFeeAmountQuote
              ? toTokenAmount(t2, options.positionInfo.tokenFeeAmountQuote, { amountIsBN: true })
              : undefined,
          price: options.positionInfo.tokenQuote && options.prices?.get(options.positionInfo.tokenQuote),
        },
      ]
    : []
}
