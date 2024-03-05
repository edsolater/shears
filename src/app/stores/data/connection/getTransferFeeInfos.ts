import { minus } from "@edsolater/fnkit"
import { getTransferAmountFee, type ReturnTypeFetchMultipleMintInfos } from "@raydium-io/raydium-sdk"
import type { EpochInfo } from "@solana/web3.js"
import { parseSDKBN, toBN } from "../../../utils/dataStructures/BN"
import { toTokenAmount, type TokenAmount } from "../../../utils/dataStructures/TokenAmount"
import { getEpochInfo } from "./getEpochInfo"
import { getMultiMintInfos } from "./getMultiMintInfos"
import isCurrentToken2022 from "../isCurrentToken2022"

export type ITransferAmountFee = {
  amount: TokenAmount
  fee?: TokenAmount
  /* pure + fee = amount */
  pure: TokenAmount
  /** unit: s */
  expirationTime?: number
}

/**  in main thread */
export async function getTransferFeeInfo({
  tokenAmount,
  addFee,
  fetchedEpochInfo,
  fetchedMints,
}: {
  tokenAmount: TokenAmount
  addFee?: boolean
  /** provied for faster fetch */
  fetchedEpochInfo?: Promise<EpochInfo> | EpochInfo
  /** provied for faster fetch */
  fetchedMints?: Promise<ReturnTypeFetchMultipleMintInfos> | ReturnTypeFetchMultipleMintInfos
}): Promise<ITransferAmountFee | undefined> {
  const getMints = () => fetchedMints ?? getMultiMintInfos({ mints: [tokenAmount].flat().map((i) => i.token.mint) })
  const getEpoch = () => fetchedEpochInfo ?? getEpochInfo()

  if (!isCurrentToken2022(tokenAmount.token.mint))
    return { amount: tokenAmount, pure: tokenAmount } as ITransferAmountFee
  const [epochInfo, mintInfos] = await Promise.all([getEpoch(), getMints()])
  return getTransferFeeInfoSync({ tokenAmount, addFee, mintInfos, epochInfo })
}

/**  in main thread */
export function getTransferFeeInfoSync({
  tokenAmount,
  addFee,
  mintInfos,
  epochInfo,
}: {
  tokenAmount: TokenAmount
  addFee?: boolean
  /** provied for faster fetch */
  mintInfos: ReturnTypeFetchMultipleMintInfos
  epochInfo: EpochInfo
}): ITransferAmountFee {
  const mint = tokenAmount.token.mint
  const feeConfig = mintInfos[mint]?.feeConfig
  const rawInfo = getTransferAmountFee(toBN(tokenAmount.amount), feeConfig, epochInfo, Boolean(addFee))
  const allAmount = toTokenAmount(tokenAmount.token, parseSDKBN(rawInfo.amount), { amountIsBN: true })
  const fee =
    rawInfo.fee != null ? toTokenAmount(tokenAmount.token, parseSDKBN(rawInfo.fee), { amountIsBN: true }) : undefined
  const pure = toTokenAmount(tokenAmount.token, minus(allAmount.amount, fee?.amount ?? 0), { amountIsBN: true })
  const info = { amount: allAmount, fee, pure, expirationTime: rawInfo.expirationTime } as ITransferAmountFee
  return info
}
