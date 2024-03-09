import { assert, eq, Numberish } from "@edsolater/fnkit"
import { TradeV2 } from "@raydium-io/raydium-sdk"
import { appProgramId } from "../../utils/common/config"
import { getConnection } from "../../utils/dataStructures/Connection"
import { toPub } from "../../utils/dataStructures/Publickey"
import { Token } from "./token/type"
import { txHandler, type UITxVersion } from "../../utils/txHandler"
import { getTxHandlerBudgetConfig } from "../../utils/txHandler/getTxHandlerBudgetConfig"
import { getRealSDKTxVersion } from "../../utils/txHandler/txVersion"
import { getBestCalcResultCache } from "./utils/calculateSwapRouteInfos"

export interface TxSwapOptions {
  owner: string
  checkInfo: {
    rpcURL: string
    coin1: Token
    coin2: Token
    amount1: Numberish
    // amount2: Numberish
    direction: "1 → 2" | "2 → 1"
  }
  txVersion?: UITxVersion
}

export function txSwap(options: TxSwapOptions) {
  const connection = getConnection(options.checkInfo.rpcURL)
  const neariestSwapBestResultCache = getBestCalcResultCache()
  assert(neariestSwapBestResultCache, "swapInfo not found")
  assert(neariestSwapBestResultCache.params.input.mint === options.checkInfo.coin1.mint, "coin1 is not match")
  assert(neariestSwapBestResultCache.params.output.mint === options.checkInfo.coin2.mint, "coin2 is not match")
  assert(
    eq(neariestSwapBestResultCache.params.inputAmount.amount, options.checkInfo.amount1),
    "inputAmount is not match",
  )

  return txHandler(
    {
      connection,
      owner: options.owner,
      txVersion: "V0",
    },
    async ({ baseUtils: { owner, connection, getSDKTokenAccounts } }) => {
      //TODO: no two fetch await
      console.log(1)
      const txBudgetConfig = await getTxHandlerBudgetConfig()
      console.log(2)
      const sdkTokenAccounts = await getSDKTokenAccounts()
      assert(sdkTokenAccounts, "token account can't load")
      // const { sdkTokenAccounts } = await getTokenAccounts({ connection, owner: toPubString(owner) })
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
        routeProgram: toPub(appProgramId.Router),
        makeTxVersion: getRealSDKTxVersion(options.txVersion),
        computeBudgetConfig: txBudgetConfig,
      })
      console.log("innerTransactions: ", innerTransactions)
      return innerTransactions
    },
    { sendMode: "queue(continue-without-check-transaction-response)" },
  )
}
