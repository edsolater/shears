import { type Numberish } from "@edsolater/fnkit"
import { createLazyMemo, usePromise } from "@edsolater/pivkit"
import { createEffect, on } from "solid-js"
import { createStore, reconcile } from "solid-js/store"
import { useShuckValue } from "../../../../packages/conveyor/solidjsAdapter/useShuck"
import { type Amount } from "../../../utils/dataStructures/TokenAmount"
import type { USDVolume } from "../../../utils/dataStructures/type"
import { useWalletOwner } from "../../wallet/store"
import { shuck_balances, shuck_rpc, shuck_slippage, shuck_tokenPrices, shuck_tokens } from "../store"
import { useToken } from "../token/useToken"
import { useTokenPrice } from "../tokenPrice/useTokenPrice"
import type { ClmmInfo, ClmmUserPositionAccount } from "../types/clmm"
import {
  AdditionalClmmUserPositionAccountMethods,
  getClmmUserPositionAccountAdditionalInfo,
} from "./getClmmUserPositionAccountAdditionalInfo"

/** for solidjs store */
type AdditionalClmmUserPositionAccountState = {
  rangeName: string
  inRange: boolean
  userLiquidityUSD: USDVolume | undefined
  pendingRewardAmountUSD: Numberish | undefined
  hasRewardTokenAmount: boolean
  isHarvestable: boolean
} & AdditionalClmmUserPositionAccountMethods

/** for {@link AdditionalClmmUserPositionAccountState}'s method txClmmPositionIncrease */
export type TxClmmPositionIncreaseUIFnParams = { amountA: Amount } | { amountB: Amount }
/** for {@link AdditionalClmmUserPositionAccountState}'s method txClmmPositionDecrease */
export type TxClmmPositionDecreaseUIFnParams = { amountA: Amount } | { amountB: Amount }
export type TxClmmPositionSetToUIFnParams = { usd: Amount }
/**
 * hooks
 * hydrate {@link ClmmUserPositionAccount} to ui used data
 */
// TODO: should move inner to calcXXX() functions
export function useClmmUserPositionAccount(
  clmmInfo: ClmmInfo,
  positionInfo: ClmmUserPositionAccount,
): AdditionalClmmUserPositionAccountState & ClmmUserPositionAccount {
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

  const {
    rangeName,
    inRange,
    userLiquidityUSD,
    pendingRewardAmountUSD: pendingRewardAmountUSDPromise,
    hasRewardTokenAmount,
    isHarvestable,
    buildPositionIncreaseTxConfig,
    buildPositionDecreaseTxConfig,
    buildPositionSetTxConfig,
    buildPositionShowHandTxConfig,
  } = getClmmUserPositionAccountAdditionalInfo({
    clmmInfo,
    positionInfo,
    pricesMap,
    tokens,
    rpcUrl: () => rpcS()?.url,
    owner: ownerS,
    slippage: slippageS,
    balances: balancesS,
    tokenA: () => tokenA,
    tokenB: () => tokenB,
    priceA,
    priceB,
  })
  const pendingRewardAmountUSD = usePromise(pendingRewardAmountUSDPromise)
  const [userPositionAccountStore, setUserPositionStore] = createStore(
    positionInfo as AdditionalClmmUserPositionAccountState & ClmmUserPositionAccount,
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
      buildPositionIncreaseTxConfig,
      buildPositionDecreaseTxConfig,
      buildPositionSetTxConfig,
      buildPositionShowHandTxConfig,
    }),
  )

  return userPositionAccountStore
}
