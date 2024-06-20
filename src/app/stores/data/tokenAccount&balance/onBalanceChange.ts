import { abs, applyDecimal, gt, minus, type Numberish, type Subscription } from "@edsolater/fnkit"
import type { Mint } from "../../../utils/dataStructures/type"
import { shuck_balances } from "../store"
import { getCurrentToken } from "../token/getCurrentToken"
import type { Token } from "../token/type"

type BalanceChangeCallback = (utils: {
  balanceBN: Numberish | undefined
  balance: Numberish | undefined
  prevBalance: Numberish | undefined
  prevBalanceBN: Numberish | undefined
  token: Token | undefined
}) => void
/**
 * in main thread
 */
export function onBalanceChange(
  mint: Mint,
  onChange: BalanceChangeCallback,
  options?: { once?: boolean; miniBalanceChangeAmount?: Numberish },
): Subscription {
  const subscription = shuck_balances.subscribe(
    (balancesBNs, prevBalancesBNs) => {
      const token = getCurrentToken(mint)
      const balanceBN = balancesBNs[mint]
      const prevBalanceBN = prevBalancesBNs?.[mint]
      if (
        balanceBN !== prevBalanceBN &&
        gt(abs(minus(balanceBN, prevBalanceBN ?? 0)), options?.miniBalanceChangeAmount ?? 0.01)
      ) {
        onChange({
          balanceBN,
          prevBalanceBN,
          balance: token && balanceBN != null ? applyDecimal(balanceBN, token.decimals) : undefined,
          prevBalance: token && prevBalanceBN != null ? applyDecimal(prevBalanceBN, token.decimals) : undefined,
          token,
        })
        if (options?.once) {
          setTimeout(() => {
            subscription.unsubscribe()
          }, 0)
        }
      }
    },
    { key: "to onBalanceChange" },
  )
  return subscription
}
