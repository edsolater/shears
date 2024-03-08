/**************************************************************************
 *
 * @tags CLMM utils data-calculation
 *
 **************************************************************************/

import { get, isPositive, isZero, type Numberish } from "@edsolater/fnkit"
import { getAmountBNFromTokenAmount, type TokenAmount } from "../../utils/dataStructures/TokenAmount"
import type { ClmmInfos } from "./types/clmm"
import { Clmm } from "@raydium-io/raydium-sdk"
import { sdkClmmInfoCache } from "./utils/sdkParseClmmInfos"
import toPubString from "../../utils/dataStructures/Publickey"
import { parseSDKBN, toSDKBN } from "../../utils/dataStructures/BN"
import { getEpochInfo } from "./connection/getEpochInfo"
import { getMultiMintInfos } from "./connection/getMultiMintInfos"
import { jsonClmmInfoCache } from "./utils/fetchClmmJson"
import isCurrentToken2022 from "./isCurrentToken2022"
import { parseSDKTransferAmountFee, type TransferAmountFee } from "./misc/transferAmountFee"

/**
 * @todo Tempdev
 */
export async function getClmmIncreaseTxLiquidityAndBoundaryFromAmount(
  tokenAmount: TokenAmount,
  payload: {
    clmmId: string
    positionNftMint: string
    baseAmount: Numberish

    sourceClmmInfos: ClmmInfos | undefined
  },
): Promise<
  | {
      liquidity: Numberish
      amountAInfo: TransferAmountFee
      amountBInfo: TransferAmountFee
    }
  | undefined
> {
  const epochInfoPromise = getEpochInfo()
  const jsonClmmInfo = jsonClmmInfoCache.get(payload.clmmId)
  if (!jsonClmmInfo) return undefined
  const token2022InfosPromise = getMultiMintInfos({
    mints: [jsonClmmInfo.mintA, jsonClmmInfo.mintA].filter(isCurrentToken2022),
  })
  const sdkClmmInfo = sdkClmmInfoCache.get(payload.clmmId)
  const sdkClmmPositionInfo = sdkClmmInfo?.positionAccount?.find(
    (p) => toPubString(p.nftMint) === payload.positionNftMint,
  )

  if (!sdkClmmInfo || !sdkClmmPositionInfo) return undefined
  const isInputSideA = toPubString(sdkClmmInfo.state.mintA.mint) === tokenAmount.token.mint
  const [epochInfo, token2022Infos] = await Promise.all([epochInfoPromise, token2022InfosPromise])
  const { liquidity, amountA, amountB, amountSlippageA, amountSlippageB } = Clmm.getLiquidityAmountOutFromAmountIn({
    poolInfo: sdkClmmInfo.state,
    slippage: 0,
    inputA: isInputSideA,
    tickLower: sdkClmmPositionInfo.tickLower,
    tickUpper: sdkClmmPositionInfo.tickUpper,
    amount: toSDKBN(getAmountBNFromTokenAmount(tokenAmount)),
    add: true,
    epochInfo,
    token2022Infos,
    amountHasFee: true,
  })
  return { liquidity: parseSDKBN(liquidity), amountAInfo: parseSDKTransferAmountFee(amountA), amountBInfo: parseSDKTransferAmountFee(amountB) }
}
