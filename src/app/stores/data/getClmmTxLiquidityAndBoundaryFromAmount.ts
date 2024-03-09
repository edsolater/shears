/**************************************************************************
 *
 * @tags CLMM utils data-calculation
 *
 **************************************************************************/

import type { Numberish } from "@edsolater/fnkit"
import { Clmm } from "@raydium-io/raydium-sdk"
import { parseSDKBN, toSDKBN } from "../../utils/dataStructures/BN"
import toPubString from "../../utils/dataStructures/Publickey"
import type { AmountBN } from "../../utils/dataStructures/TokenAmount"
import { getEpochInfo } from "./connection/getEpochInfo"
import { getMultiMintInfos } from "./connection/getMultiMintInfos"
import isCurrentToken2022 from "./isCurrentToken2022"
import { parseSDKTransferAmountFee, type TransferAmountFee } from "./misc/transferAmountFee"
import { tokensMap } from "./portActions/loadTokens_worker"
import { jsonClmmInfoCache } from "./utils/fetchClmmJson"
import { sdkClmmInfoCache } from "./utils/sdkParseClmmInfos"

/**
 * in worker thread
 */
export async function getClmmIncreaseTxLiquidityAndBoundaryFromAmount(
  amount: AmountBN,
  payload: {
    rpcUrl: string
    clmmId: string
    positionNftMint: string

    amountSide: "A" | "B"
  },
): Promise<
  | {
      liquidity: Numberish
      amountAInfo: TransferAmountFee
      amountBInfo: TransferAmountFee
    }
  | undefined
> {
  const epochInfoPromise = getEpochInfo({ rpcUrl: payload.rpcUrl })
  const jsonClmmInfo = jsonClmmInfoCache.get(payload.clmmId)
  if (!jsonClmmInfo) return undefined
  const token2022InfosPromise = getMultiMintInfos(
    [jsonClmmInfo.mintA, jsonClmmInfo.mintA].filter((m) => isCurrentToken2022(m, { tokens: tokensMap })),
    { rpcUrl: payload.rpcUrl },
  )
  const sdkClmmInfo = sdkClmmInfoCache.get(payload.clmmId)
  const sdkClmmPositionInfo = sdkClmmInfo?.positionAccount?.find(
    (p) => toPubString(p.nftMint) === payload.positionNftMint,
  )

  if (!sdkClmmInfo || !sdkClmmPositionInfo) return undefined
  const isInputSideA = payload.amountSide === "A"
  const [epochInfo, token2022Infos] = await Promise.all([epochInfoPromise, token2022InfosPromise])
  const { liquidity, amountA, amountB, amountSlippageA, amountSlippageB } = Clmm.getLiquidityAmountOutFromAmountIn({
    poolInfo: sdkClmmInfo.state,
    slippage: 0,
    inputA: isInputSideA,
    tickLower: sdkClmmPositionInfo.tickLower,
    tickUpper: sdkClmmPositionInfo.tickUpper,
    amount: toSDKBN(amount),
    add: true,
    epochInfo,
    token2022Infos,
    amountHasFee: true,
  })
  return {
    liquidity: parseSDKBN(liquidity),
    amountAInfo: parseSDKTransferAmountFee(amountA),
    amountBInfo: parseSDKTransferAmountFee(amountB),
  }
}
