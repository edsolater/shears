/**************************************************************************
 *
 * @tags CLMM tx
 *
 **************************************************************************/

import { assert, isPositive, minus, type Percent } from "@edsolater/fnkit"
import { Clmm } from "@raydium-io/raydium-sdk"
import { toSDKBN } from "../../utils/dataStructures/BN"
import { getConnection } from "../../utils/dataStructures/Connection"
import { toPubString } from "../../utils/dataStructures/Publickey"
import type { Amount } from "../../utils/dataStructures/TokenAmount"
import { getTxHandlerUtils, handleTxFromShortcut, type ShortcutInnerTransactions } from "../../utils/txHandler"
import { getClmmDecreaseTxLiquidityAndBoundaryFromAmount } from "./getClmmTxLiquidityAndBoundaryFromAmount"
import { isTokenSOLWSOL } from "./token/utils"
import { jsonClmmInfoCache } from "./utils/fetchClmmJson"
import { sdkClmmInfoCache } from "./utils/sdkParseClmmInfos"
import { toHumanReadable } from "./utils/toHumanReadable"

export type TxClmmPositionDecreaseParams = {
  rpcUrl: string
  owner: string
  clmmId: string
  positionNftMint: string
  slippage?: Percent // e.g. 0.01

  amountA?: Amount
  amountB?: Amount
}

/** need amountA or amountB */
export async function txClmmPositionDecrease(params: TxClmmPositionDecreaseParams) {
  return handleTxFromShortcut(await createTxClmmPositionDecreaseTransaction(params))
}

/** need amountA or amountB */
async function createTxClmmPositionDecreaseTransaction(
  params: TxClmmPositionDecreaseParams,
): Promise<ShortcutInnerTransactions> {
  const amount = "amountA" in params ? params.amountA : params.amountB
  const amountSide = "amountA" in params ? "A" : "B"
  console.log("amountSide: ", amountSide)
  console.log("[worker tx core algorithm] start compose tx clmm position decrease")
  assert(isPositive(amount), "amountA should be positive")
  const connection = getConnection(params.rpcUrl)
  assert(connection, "connection not ready, connection: " + connection)
  const jsonClmmInfo = jsonClmmInfoCache.get(params.clmmId)
  assert(jsonClmmInfo, "jsonClmmInfo not ready, jsonClmmInfo: " + jsonClmmInfo)
  const sdkClmmInfo = sdkClmmInfoCache.get(params.clmmId)
  const sdkClmmPositionInfo = sdkClmmInfo?.positionAccount?.find(
    (p) => toPubString(p.nftMint) === params.positionNftMint,
  )
  assert(sdkClmmInfo, "sdkClmmInfo not ready, sdkClmmInfo: " + sdkClmmInfo)
  assert(sdkClmmPositionInfo, "sdkClmmPositionInfo not ready, sdkClmmPositionInfo: " + sdkClmmPositionInfo)

  const { owner, getSDKBudgetConfig, getSDKTokenAccounts, sdkTxVersion, sdkLookupTableCache } = getTxHandlerUtils({
    rpcUrl: params.rpcUrl,
    owner: params.owner,
  })
  const txBudgetConfigPromise = getSDKBudgetConfig()
  const sdkTokenAccountsPromise = getSDKTokenAccounts()

  const infoPromise = getClmmDecreaseTxLiquidityAndBoundaryFromAmount({
    amount: amount,
    rpcUrl: params.rpcUrl,
    clmmId: params.clmmId,
    positionNftMint: params.positionNftMint,
    amountSide: amountSide,
  })
  const [txBudgetConfig, sdkTokenAccounts, info] = await Promise.all([
    txBudgetConfigPromise,
    sdkTokenAccountsPromise,
    infoPromise,
  ])

  assert(info, `${getClmmDecreaseTxLiquidityAndBoundaryFromAmount.name} fail to work`)
  const { liquidity, amountAInfo, amountBInfo } = info
  const { amountWithFeeBN: amountA, feeBN: feeA } = amountAInfo
  const { amountWithFeeBN: amountB, feeBN: feeB } = amountBInfo

  assert(txBudgetConfig, "txBudgetConfig can't load")
  assert(sdkTokenAccounts, "token account can't load")
  const treatWalletSolAsPoolBalance = isTokenSOLWSOL(jsonClmmInfo.mintA) || isTokenSOLWSOL(jsonClmmInfo.mintB)
  const txParams = {
    connection: connection,
    liquidity: toSDKBN(liquidity),
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
    amountMinA: toSDKBN(feeA ? minus(amountA, feeA) : amountA),
    amountMinB: toSDKBN(feeB ? minus(amountB, feeB) : amountB),
    makeTxVersion: sdkTxVersion,
    lookupTableCache: sdkLookupTableCache,
  }
  console.log("[tx] clmm position decrease txParams: ", toHumanReadable(txParams))
  const { innerTransactions } = await Clmm.makeDecreaseLiquidityInstructionSimple(txParams).catch((e) => {
    console.error(e)
    return { innerTransactions: [] }
  })
  assert(innerTransactions, "sdk compose innerTransactions failed, innerTransactions: " + innerTransactions)

  return Object.assign(innerTransactions, { connection, owner: params.owner })
}
