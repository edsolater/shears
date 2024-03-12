/**************************************************************************
 *
 * @tags CLMM tx
 *
 **************************************************************************/

import { assert, isLessThanOne, isObject, isPositive, minus, mul, type Percent } from "@edsolater/fnkit"
import { Clmm } from "@raydium-io/raydium-sdk"
import { toSDKBN } from "../../utils/dataStructures/BN"
import { getConnection } from "../../utils/dataStructures/Connection"
import toPubString from "../../utils/dataStructures/Publickey"
import { type AmountBN } from "../../utils/dataStructures/TokenAmount"
import { txHandler } from "../../utils/txHandler"
import { getClmmIncreaseTxLiquidityAndBoundaryFromAmount } from "./getClmmTxLiquidityAndBoundaryFromAmount"
import { isTokenSOLWSOL } from "./token/utils"
import { jsonClmmInfoCache } from "./utils/fetchClmmJson"
import { sdkClmmInfoCache } from "./utils/sdkParseClmmInfos"
import { toHumanReadable } from "./utils/toHumanReadable"

export type TxClmmPositionIncreaseParams = {
  rpcUrl: string
  owner: string
  clmmId: string
  positionNftMint: string
  slippage: Percent // e.g. 0.01
  amount: AmountBN
  amountSide: "A" | "B"
}

export async function txClmmPositionIncrease(params: TxClmmPositionIncreaseParams) {
  console.log("start compose tx clmm position increase")
  assert(isLessThanOne(params.slippage), `slippage shouldnot bigger than 1, slippage: ${params.slippage}`)
  assert(isPositive(params.amount), "amountA should be positive, amountA: " + params.amount.toString())
  const connection = getConnection(params.rpcUrl)
  assert(connection, "connection not ready, connection: " + connection)
  const jsonClmmInfo = jsonClmmInfoCache.get(params.clmmId)
  const sdkClmmInfo = sdkClmmInfoCache.get(params.clmmId)
  const sdkClmmPositionInfo = sdkClmmInfo?.positionAccount?.find(
    (p) => toPubString(p.nftMint) === params.positionNftMint,
  )
  assert(jsonClmmInfo, "jsonClmmInfo not ready, jsonClmmInfo: " + jsonClmmInfo)
  assert(sdkClmmInfo, "sdkClmmInfo not ready, sdkClmmInfo: " + sdkClmmInfo)
  assert(sdkClmmPositionInfo, "sdkClmmPositionInfo not ready, sdkClmmPositionInfo: " + sdkClmmPositionInfo)

  const info = await getClmmIncreaseTxLiquidityAndBoundaryFromAmount({
    amount: params.amount,
    rpcUrl: params.rpcUrl,
    clmmId: params.clmmId,
    positionNftMint: params.positionNftMint,
    amountSide: params.amountSide,
  })
  assert(info, `${getClmmIncreaseTxLiquidityAndBoundaryFromAmount.name} fail to work`)
  const { liquidity, amountAInfo, amountBInfo } = info
  const amountA = amountAInfo.amountWithFeeBN
  const amountB = amountBInfo.amountWithFeeBN

  const txEventCenter = txHandler(
    {
      connection,
      owner: params.owner,
    },
    async ({
      baseUtils: { owner, connection, getSDKTokenAccounts, sdkLookupTableCache, sdkTxVersion, getBudgetConfig },
    }) => {
      //TODO: no two fetch await
      const txBudgetConfigPromise = getBudgetConfig()
      const sdkTokenAccountsPromise = getSDKTokenAccounts()
      const [txBudgetConfig, sdkTokenAccounts] = await Promise.all([txBudgetConfigPromise, sdkTokenAccountsPromise])
      assert(sdkTokenAccounts, "token account can't load")
      const treatWalletSolAsPoolBalance = isTokenSOLWSOL(jsonClmmInfo.mintA) || isTokenSOLWSOL(jsonClmmInfo.mintB)
      const txParams = {
        connection: connection,
        liquidity: toSDKBN(mul(liquidity, minus(1, params.slippage))),
        poolInfo: sdkClmmInfo.state,
        ownerInfo: {
          feePayer: owner,
          wallet: owner,
          tokenAccounts: sdkTokenAccounts,
          useSOLBalance: treatWalletSolAsPoolBalance,
        },
        ownerPosition: sdkClmmPositionInfo,
        computeBudgetConfig: txBudgetConfig,
        checkCreateATAOwner: true,
        amountMaxA: toSDKBN(amountA),
        amountMaxB: toSDKBN(amountB),
        makeTxVersion: sdkTxVersion,
        lookupTableCache: sdkLookupTableCache,
      }
      const { innerTransactions } = await Clmm.makeIncreasePositionFromLiquidityInstructionSimple(txParams)
      assert(innerTransactions, "sdk compose innerTransactions failed, innerTransactions: " + innerTransactions)
      return innerTransactions
    },
    { sendMode: "queue" },
  )
  // assert(options.liquidity, "liquidity not found") // Temp for Dev. // TODO: use getClmmIncreaseTxLiquidityAndBoundaryFromAmount
  // assert(options.amountB, "amountB not found") // Temp for Dev. // TODO: use getClmmIncreaseTxLiquidityAndBoundaryFromAmount

  return txEventCenter
}
