import { assert } from '@edsolater/fnkit'
import { TradeV2 } from '@raydium-io/raydium-sdk'
import { getConnection } from '../../../utils/common/getConnection'
import toPubString from '../../../utils/dataStructures/Publickey'
import { Token } from '../../../utils/dataStructures/Token'
import { getOwnerTokenAccounts } from '../../../utils/dataStructures/TokenAccount'
import { Numberish } from '../../../utils/dataStructures/type'
import { SignAllTransactionsFunction, txHandler } from '../../../utils/txHandler'
import { getTxHandlerBudgetConfig } from '../../../utils/txHandler/getTxHandlerBudgetConfig'
import { getBestCalcResultCache } from './calculateSwapRouteInfos'
import { eq } from '../../../utils/dataStructures/basicMath/compare'

export interface TxSwapOptions {
  owner: string
  checkInfo: {
    rpcUrl: string
    coin1: Token
    coin2: Token
    amount1: Numberish
    // amount2: Numberish
    direction: '1 → 2' | '2 → 1'
  }
}

export function txSwap_getInnerTransaction(options: TxSwapOptions) {
  const connection = getConnection(options.checkInfo.rpcUrl)
  const neariestSwapBestResultCache = getBestCalcResultCache()
  assert(neariestSwapBestResultCache, 'swapInfo not found')
  assert(neariestSwapBestResultCache.params.input.mint === options.checkInfo.coin1.mint, 'coin1 is not match')
  assert(neariestSwapBestResultCache.params.output.mint === options.checkInfo.coin2.mint, 'coin2 is not match')
  assert(
    eq(neariestSwapBestResultCache.params.inputAmount.amount, options.checkInfo.amount1),
    'inputAmount is not match',
  )

  return txHandler(
    {
      connection,
      owner: options.owner,
      txVersion: 'V0',
    },
    async ({ baseUtils: { owner, connection } }) => {
      //TODO: no two fetch await
      console.log(1)
      const txBudgetConfig = await getTxHandlerBudgetConfig()
      console.log(2)
      const { sdkTokenAccounts } = await getOwnerTokenAccounts({ connection, owner: toPubString(owner) })
      console.log(3)
      const { innerTransactions } = await TradeV2.makeSwapInstructionSimple({
        connection,
        swapInfo: neariestSwapBestResultCache.sdkBestResult,
        ownerInfo: {
          wallet: owner,
          tokenAccounts: sdkTokenAccounts,
          associatedOnly: true,
          checkCreateATAOwner: true,
        },
        checkTransaction: true,
        computeBudgetConfig: txBudgetConfig,
      })
      console.log('innerTransactions: ', innerTransactions)
      return innerTransactions
    },
    { sendMode: 'queue(all-settle)' },
  )
}
