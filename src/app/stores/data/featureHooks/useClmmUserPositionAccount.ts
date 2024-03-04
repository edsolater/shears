import { add, get, isPositive, mul, shakeNil, type Numberish, asyncMap } from '@edsolater/fnkit'
import { createMemo, createSignal, on } from 'solid-js'
import { useToken } from '../token/useToken'
import { useTokenPrice } from '../tokenPrice/useTokenPrice'
import type { ClmmInfo, ClmmUserPositionAccount } from '../types/clmm'
import { toRenderable } from '../../../utils/common/toRenderable'
import type { Price, USDVolume } from '../../../utils/dataStructures/type'
import { applyDecimal } from '../../../pages/clmm'
import { shuck_tokenPrices, shuck_tokens } from '../store'
import { useShuckValue } from '../../../../packages/conveyor/solidjsAdapter/useShuck'
import { toTokenAmount, type TokenAmount } from '../../../utils/dataStructures/TokenAmount'
import isCurrentToken2022 from '../isCurrentToken2022'
import { getEpochInfo } from '../connection/getEpochInfo'
import { getMultiMintInfos } from '../connection/getMultiMintInfos'
import { getTransferFeeInfo } from '../connection/getTransferFeeInfos'
import { usePromise } from '@edsolater/pivkit'

/**
 * hooks
 * hydrate {@link ClmmUserPositionAccount} to ui used data
 */
export function useClmmUserPositionAccount(clmmInfo: ClmmInfo, userPositionAccount: ClmmUserPositionAccount) {
  const tokenA = useToken(() => clmmInfo.base)
  const tokenB = useToken(() => clmmInfo.quote)
  const priceA = useTokenPrice(() => clmmInfo.base)
  const priceB = useTokenPrice(() => clmmInfo.quote)
  const pricesMap = useShuckValue(shuck_tokenPrices)
  const tokens = useShuckValue(shuck_tokens)

  const userLiquidity = createMemo(() => {
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

  const rangeName = createMemo(
    () =>
      `${toRenderable(userPositionAccount.priceLower, { decimals: 4 })}-${toRenderable(userPositionAccount.priceUpper, { decimals: 4 })}`,
  )

  const rewardsAmountsWithFees: () => {
    tokenAmount: TokenAmount | undefined
    price: Price | undefined
  }[] = createMemo(
    () =>
      userPositionAccount?.rewardInfos.map((info) => {
        if (isPositive(info.penddingReward)) {
          setHasRewardTokenAmount(true)
        }
        const price = info.token && pricesMap()?.get(info.token)

        const t = info.token ? get(tokens(), info.token) : undefined
        return {
          tokenAmount: t && info.penddingReward ? toTokenAmount(t, info.penddingReward) : undefined,
          price: price,
        }
      }) ?? [],
  )

  const feesAmountsWithFees: () => {
    tokenAmount: TokenAmount | undefined
    price: Price | undefined
  }[] = createMemo(() => {
    const t1 = userPositionAccount.tokenBase ? get(tokens(), userPositionAccount.tokenBase) : undefined
    const t2 = userPositionAccount.tokenQuote ? get(tokens(), userPositionAccount.tokenQuote) : undefined
    return userPositionAccount
      ? [
          {
            tokenAmount:
              t1 && userPositionAccount.tokenFeeAmountBase
                ? toTokenAmount(t1, userPositionAccount.tokenFeeAmountBase)
                : undefined,
            price: userPositionAccount.tokenBase && pricesMap()?.get(userPositionAccount.tokenBase),
          },
          {
            tokenAmount:
              t2 && userPositionAccount.tokenFeeAmountQuote
                ? toTokenAmount(t2, userPositionAccount.tokenFeeAmountQuote)
                : undefined,
            price: userPositionAccount.tokenQuote && pricesMap()?.get(userPositionAccount.tokenQuote),
          },
        ]
      : []
  })

  const hasFeeTokenAmount = createMemo(
    () => isPositive(userPositionAccount.tokenFeeAmountBase) || isPositive(userPositionAccount.tokenFeeAmountQuote),
  )

  const pendingTotalWithFees = createMemo(() =>
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
    on([rewardsAmountsWithFees, feesAmountsWithFees], async () => {
      const mints = shakeNil(
        rewardsAmountsWithFees()
          .concat(feesAmountsWithFees())
          .map((i) => i.tokenAmount?.token.mint),
      )

      const [epochInfo, mintInfos] = mints.some((m) => !isCurrentToken2022(m))
        ? []
        : await Promise.all([getEpochInfo(), getMultiMintInfos({ mints })])

      const ams = await asyncMap(
        rewardsAmountsWithFees().concat(feesAmountsWithFees()),
        async ({ tokenAmount, ...rest }) => {
          if (!tokenAmount) return
          const feeInfo = await getTransferFeeInfo({
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
  const pendingRewardAmount = usePromise(pendingRewardAmountPromise)

  const isHarvestable = createMemo(() =>
    isPositive(pendingTotalWithFees()) || hasRewardTokenAmount() || hasFeeTokenAmount() ? true : false,
  )
  return { rangeName, userLiquidity, pendingRewardAmount, hasRewardTokenAmount, isHarvestable }
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
