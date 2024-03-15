import {
  add,
  assert,
  asyncMap,
  equal,
  get,
  gt,
  isPositive,
  lt,
  mul,
  shakeNil,
  toFormattedNumber,
  type Numberish,
  applyDecimal,
  minus,
  isExist,
} from "@edsolater/fnkit"
import { createLazyMemo, usePromise } from "@edsolater/pivkit"
import { createEffect, createMemo, createSignal, on } from "solid-js"
import { createStore, reconcile } from "solid-js/store"
import { useShuckValue } from "../../../../packages/conveyor/solidjsAdapter/useShuck"
import { toTokenAmount, type Amount, type TokenAmount } from "../../../utils/dataStructures/TokenAmount"
import type { Price, USDVolume } from "../../../utils/dataStructures/type"
import type { TxHandlerEventCenter } from "../../../utils/txHandler"
import { txDispatcher } from "../../../utils/txHandler/txDispatcher_main"
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
} from "../store"
import { useToken } from "../token/useToken"
import { useTokenPrice } from "../tokenPrice/useTokenPrice"
import type { ClmmInfo, ClmmUserPositionAccount } from "../types/clmm"

type AdditionalClmmUserPositionAccount = {
  rangeName: string
  inRange: boolean
  userLiquidityUSD: USDVolume | undefined
  pendingRewardAmountUSD: Numberish | undefined
  hasRewardTokenAmount: boolean
  isHarvestable: boolean
  txClmmPositionIncrease: (params: TxClmmPositionIncreaseUIFnParams) => TxHandlerEventCenter
  txClmmPositionDecrease: (params: TxClmmPositionDecreaseUIFnParams) => TxHandlerEventCenter
  txClmmPositionSet: (params: TxClmmPositionSetToUIFnParams) => TxHandlerEventCenter | undefined
  txClmmPositionIncreaseAllWalletRest: () => TxHandlerEventCenter | undefined
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
export function useClmmUserPositionAccount(
  clmmInfo: ClmmInfo,
  userPositionAccount: ClmmUserPositionAccount,
): AdditionalClmmUserPositionAccount & ClmmUserPositionAccount {
  const tokenA = useToken(() => clmmInfo.base)
  const tokenB = useToken(() => clmmInfo.quote)
  const priceA = useTokenPrice(() => clmmInfo.base)
  const priceB = useTokenPrice(() => clmmInfo.quote)
  const pricesMap = useShuckValue(shuck_tokenPrices)
  const tokens = useShuckValue(shuck_tokens) // TODO let still invisiable unless actual use this value
  const rpcS = useShuckValue(shuck_rpc)
  const ownerS = useWalletOwner()
  const slippageS = useShuckValue(shuck_slippage)
  const balancesS = useShuckValue(shuck_balances)
  const tokenAccountsS = useShuckValue(shuck_tokenAccounts)
  const userLiquidityUSD = createLazyMemo(() => {
    const tokenAPrices = priceA()
    const tokenBPrices = priceB()
    if (!tokenAPrices || !tokenBPrices) return undefined
    const tokenADecimal = tokenA.decimals
    const tokenBDecimal = tokenB.decimals
    const amountABN = userPositionAccount.amountBaseBN
    const amountBBN = userPositionAccount.amountQuoteBN
    if (amountABN === undefined || amountBBN === undefined) return undefined
    return getLiquidityVolume(tokenAPrices, tokenBPrices, tokenADecimal, tokenBDecimal, amountABN, amountBBN)
  })

  const [hasRewardTokenAmount, setHasRewardTokenAmount] = createSignal(false)

  const rangeName = createLazyMemo(
    () =>
      `${toFormattedNumber(userPositionAccount.priceLower, { decimals: 4 })}-${toFormattedNumber(userPositionAccount.priceUpper, { decimals: 4 })}`,
  )

  const inRange = createLazyMemo(
    () =>
      gt(clmmInfo.currentPrice, userPositionAccount.priceLower) &&
      lt(clmmInfo.currentPrice, userPositionAccount.priceUpper),
  )

  const rewardsAmountsWithFees: () => {
    tokenAmount: TokenAmount | undefined
    price: Price | undefined
  }[] = createLazyMemo(
    () =>
      userPositionAccount?.rewardInfos.map((info) => {
        if (isPositive(info.penddingReward)) {
          setHasRewardTokenAmount(true)
        }
        const price = info.token && pricesMap()?.get(info.token)

        const t = info.token ? get(tokens(), info.token) : undefined
        return {
          tokenAmount:
            t && info.penddingReward ? toTokenAmount(t, info.penddingReward, { amountIsBN: true }) : undefined,
          price: price,
        }
      }) ?? [],
  )

  const feesAmountsWithFees: () => {
    tokenAmount: TokenAmount | undefined
    price: Price | undefined
  }[] = createLazyMemo(() => {
    const t1 = userPositionAccount.tokenBase ? get(tokens(), userPositionAccount.tokenBase) : undefined
    const t2 = userPositionAccount.tokenQuote ? get(tokens(), userPositionAccount.tokenQuote) : undefined
    return userPositionAccount
      ? [
          {
            tokenAmount:
              t1 && userPositionAccount.tokenFeeAmountBase
                ? toTokenAmount(t1, userPositionAccount.tokenFeeAmountBase, { amountIsBN: true })
                : undefined,
            price: userPositionAccount.tokenBase && pricesMap()?.get(userPositionAccount.tokenBase),
          },
          {
            tokenAmount:
              t2 && userPositionAccount.tokenFeeAmountQuote
                ? toTokenAmount(t2, userPositionAccount.tokenFeeAmountQuote, { amountIsBN: true })
                : undefined,
            price: userPositionAccount.tokenQuote && pricesMap()?.get(userPositionAccount.tokenQuote),
          },
        ]
      : []
  })

  const hasFeeTokenAmount = createLazyMemo(
    () => isPositive(userPositionAccount.tokenFeeAmountBase) || isPositive(userPositionAccount.tokenFeeAmountQuote),
  )

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
  function txClmmPositionIncrease(params: TxClmmPositionIncreaseUIFnParams) {
    const rpcUrl = rpcS()?.url
    assert(rpcUrl, "for clmm position increase, rpc url not ready")
    const owner = ownerS()
    assert(owner, "for clmm position increase, owner not ready")
    const clmmId = clmmInfo.id
    const positionNftMint = userPositionAccount.nftMint
    const slippage = slippageS()
    return txDispatcher("clmm position increase", {
      ...params,
      clmmId,
      positionNftMint,
      rpcUrl,
      owner,
      slippage,
    })
  }

  /** to txDispatcher("clmm position decrease") */
  function txClmmPositionDecrease(params: TxClmmPositionDecreaseUIFnParams) {
    const rpcUrl = rpcS()?.url
    assert(rpcUrl, "for clmm position decrease, rpc url not ready")
    const owner = ownerS()
    assert(owner, "for clmm position decrease, owner not ready")
    const clmmId = clmmInfo.id
    const positionNftMint = userPositionAccount.nftMint
    const slippage = slippageS()
    return txDispatcher("clmm position decrease", {
      ...params,
      clmmId,
      positionNftMint,
      rpcUrl,
      owner,
      slippage,
    })
  }

  /** a shortcut of {@link txClmmPositionDecrease} and {@link txClmmPositionIncrease} */
  function txClmmPositionSetUSD(params: TxClmmPositionSetToUIFnParams) {
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
      if (gt(clmmInfo.currentPrice, userPositionAccount.priceUpper)) {
        //  amountSide "B"
        const price = priceB()
        assert(price, `price of ${tokenB.symbol} not ready`)
        const amount = mul(decreaseUSDAmount, price)
        return txClmmPositionDecrease({ amountB: amount })
      } else if (lt(clmmInfo.currentPrice, userPositionAccount.priceLower)) {
        //  amountSide "A"
        const price = priceA()
        assert(price, `price of ${tokenA.symbol} not ready`)
        const amount = mul(decreaseUSDAmount, price)
        return txClmmPositionDecrease({ amountA: amount })
      } else {
        throw new Error("//TEMPDEV currently not support in range decrease")
      }
    } else {
      const increaseUSDAmount = minus(params.usd, originalUSD)
      if (gt(clmmInfo.currentPrice, userPositionAccount.priceUpper)) {
        //  amountSide "B"
        const price = priceB()
        assert(price, `price of ${tokenB.symbol} not ready`)
        const amount = mul(increaseUSDAmount, price)
        return txClmmPositionIncrease({ amountB: amount })
      } else if (lt(clmmInfo.currentPrice, userPositionAccount.priceLower)) {
        //  amountSide "A"
        const price = priceA()
        assert(price, `price of ${tokenA.symbol} not ready`)
        const amount = mul(increaseUSDAmount, price)
        return txClmmPositionIncrease({ amountA: amount })
      } else {
        throw new Error("//TEMPDEV currently not support in range increase")
      }
    }
  }

  function getActionSide(): "A" | "B" {
    if (gt(clmmInfo.currentPrice, userPositionAccount.priceUpper)) {
      return "B"
    } else {
      return "A"
    }
  }

  /**
   * @todo TEMPDEV currently only support increase out of range position
   */
  function txClmmPositionIncreaseAllWalletRest() {
    const side = getActionSide()
    const balances = balancesS()
    const balanceOfTargetSideRawBN = get(balances, side === "A" ? clmmInfo.base : clmmInfo.quote)
    const balanceOfTargetSide = isExist(balanceOfTargetSideRawBN)
      ? toTokenAmount(side === "A" ? tokenA : tokenB, balanceOfTargetSideRawBN, { amountIsBN: true })
      : undefined
    assert(balanceOfTargetSide, "balance of target side not ready")
    return txClmmPositionIncrease(
      side === "A" ? { amountA: balanceOfTargetSide.amount } : { amountB: balanceOfTargetSide.amount },
    )
  }

  const [userPositionAccountStore, setUserPositionStore] = createStore(
    userPositionAccount as AdditionalClmmUserPositionAccount & ClmmUserPositionAccount,
  )
  // 🤔 really need this? is this really work?
  createEffect(
    on(
      () => userPositionAccount,
      () => {
        //@ts-expect-error no need to check
        setUserPositionStore(reconcile(userPositionAccount))
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
      txClmmPositionIncrease,
      txClmmPositionDecrease,
      txClmmPositionSet: txClmmPositionSetUSD,
      txClmmPositionIncreaseAllWalletRest,
    }),
  )

  return userPositionAccountStore
}

/**
 * used in {@link useClmmUserPositionAccount}
 */
function getLiquidityVolume(
  tokenAPrices: Price,
  tokenBPrices: Price,
  tokenADecimal: number,
  tokenBDecimal: number,
  amountABN: Numberish,
  amountBBN: Numberish,
): USDVolume {
  const amountA = applyDecimal(amountABN, tokenADecimal)
  const amountB = applyDecimal(amountBBN, tokenBDecimal)
  const wholeLiquidity = add(mul(amountA, tokenAPrices), mul(amountB, tokenBPrices))
  return wholeLiquidity
}
