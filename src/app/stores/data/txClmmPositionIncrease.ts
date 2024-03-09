/**************************************************************************
 *
 * @tags CLMM tx
 *
 **************************************************************************/

import { assert, gt, isPositive, minus, mul, type Percent } from "@edsolater/fnkit"
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

export type TxClmmPositionIncreaseParams = {
  rpcURL: string
  owner: string
  clmmId: string
  positionNftMint: string
  slippage: Percent // e.g. 0.01
  amount: AmountBN
  amountSide: "A" | "B"
}

export async function txClmmPositionIncrease(params: TxClmmPositionIncreaseParams) {
  assert(gt(params.slippage, 1), "slippage shouldnot bigger than 1")
  assert(isPositive(params.amount), "amountA should be positive")
  const connection = getConnection(params.rpcURL)
  assert(connection, "connection not ready")
  const jsonClmmInfo = jsonClmmInfoCache.get(params.clmmId)
  const sdkClmmInfo = sdkClmmInfoCache.get(params.clmmId)
  const sdkClmmPositionInfo = sdkClmmInfo?.positionAccount?.find(
    (p) => toPubString(p.nftMint) === params.positionNftMint,
  )
  assert(jsonClmmInfo, "jsonClmmInfo not ready")
  assert(sdkClmmInfo, "sdkClmmInfo not ready")
  assert(sdkClmmPositionInfo, "sdkClmmPositionInfo not ready")

  const info = await getClmmIncreaseTxLiquidityAndBoundaryFromAmount(params.amount, {
    rpcUrl: params.rpcURL,
    clmmId: params.clmmId,
    positionNftMint: params.positionNftMint,
    amountSide: params.amountSide,
  })
  assert(info, `${getClmmIncreaseTxLiquidityAndBoundaryFromAmount} fail to work`)
  const { liquidity, amountAInfo, amountBInfo } = info
  const amountA = amountAInfo.amountWithFeeBN
  const amountB = amountBInfo.amountWithFeeBN

  // assert(options.liquidity, "liquidity not found") // Temp for Dev. // TODO: use getClmmIncreaseTxLiquidityAndBoundaryFromAmount
  // assert(options.amountB, "amountB not found") // Temp for Dev. // TODO: use getClmmIncreaseTxLiquidityAndBoundaryFromAmount

  return txHandler(
    {
      connection,
      owner: params.owner,
      txVersion: "V0",
    },
    async ({
      baseUtils: { owner, connection, getSDKTokenAccounts, sdkLookupTableCache, sdkTxVersion, getBudgetConfig },
    }) => {
      //TODO: no two fetch await
      const txBudgetConfig = await getBudgetConfig()
      const sdkTokenAccounts = await getSDKTokenAccounts()
      assert(sdkTokenAccounts, "token account can't load")
      const treatWalletSolAsPoolBalance = isTokenSOLWSOL(jsonClmmInfo.mintA) || isTokenSOLWSOL(jsonClmmInfo.mintB)
      const { innerTransactions } = await Clmm.makeIncreasePositionFromLiquidityInstructionSimple({
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
      })
      assert(innerTransactions, "sdk compose innerTransactions failed")
      return innerTransactions
    },
    { sendMode: "queue" },
  )
}

function toSDKTxVersion() {}
