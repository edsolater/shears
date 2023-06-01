import { TradeV2 } from '@raydium-io/raydium-sdk'
import { getConnection } from '../../../utils/common/getConnection'
import { Token } from '../../../utils/dataStructures/Token'
import { Numberish } from '../../../utils/dataStructures/type'
import { txHandler } from '../../../utils/txHandler'
import { getTxHandlerBudgetConfig } from '../../../utils/txHandler/getTxHandlerBudgetConfig'
import { getOwnerTokenAccounts } from '../../../utils/dataStructures/TokenAccount'
import toPubString from '../../../utils/dataStructures/Publickey'

export function txSwap_getInnerTransaction(options: TxSwapOptions) {
  const connection = getConnection(options.rpcUrl)

  return txHandler(
    {
      connection,
      owner: options.owner,
      txVersion: 'V0',
      // signAllTransactions: () => {},
    },
    async ({ baseUtils: { owner, connection } }) => {
      // no two fetch await 
      const txBudgetConfig = await getTxHandlerBudgetConfig()
      const { sdkTokenAccounts } = await getOwnerTokenAccounts({ connection, owner: toPubString(owner) })
      const { innerTransactions } = await TradeV2.makeSwapInstructionSimple({
        connection,
        // swapInfo: selectedCalcResult,
        ownerInfo: {
          wallet: owner,
          tokenAccounts: sdkTokenAccounts,
          associatedOnly: true,
          checkCreateATAOwner: true,
        },
        checkTransaction: true,
        computeBudgetConfig: txBudgetConfig,
      })
      return innerTransactions
    },
    { sendMode: 'queue(all-settle)' },
  )
}
export interface TxSwapOptions {
  rpcUrl: string
  owner: string
  coin1: Token
  coin2: Token
  amount1: Numberish
  amount2: Numberish
  direction: '1 → 2' | '2 → 1'
}
