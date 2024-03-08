/**************************************************************************
 *
 * @tags TxHandler misc
 *
 **************************************************************************/
import { add } from "@edsolater/fnkit"
import { BNDivCeil, type GetTransferAmountFee as SDK_GetTransferAmountFee } from "@raydium-io/raydium-sdk"
import type { TransferFee, TransferFeeConfig } from "@solana/spl-token"
import type { EpochInfo } from "@solana/web3.js"
import BN from "bn.js"
import { parseSDKBN, toSDKBN } from "../../../utils/dataStructures/BN"
import type { AmountBN } from "../../../utils/dataStructures/TokenAmount"

export interface TransferAmountFee {
  amount: AmountBN
  fee: AmountBN | undefined
  expirationTime: number | undefined
}
const POINT = 10_000

export function parseSDKTransferAmountFee(transferAmountFee: SDK_GetTransferAmountFee): TransferAmountFee {
  return {
    amount: parseSDKBN(transferAmountFee.amount),
    fee: transferAmountFee.fee && parseSDKBN(transferAmountFee.fee),
    expirationTime: transferAmountFee.expirationTime,
  }
}
export function getTransferAmountFee(
  amount: AmountBN,
  feeConfig: TransferFeeConfig | undefined,
  epochInfo: EpochInfo,
  addFee: boolean,
): TransferAmountFee {
  const amountSDKBN = toSDKBN(amount)
  if (feeConfig === undefined) {
    return {
      amount,
      fee: undefined,
      expirationTime: undefined,
    }
  }

  const nowFeeConfig: TransferFee =
    epochInfo.epoch < feeConfig.newerTransferFee.epoch ? feeConfig.olderTransferFee : feeConfig.newerTransferFee
  const maxFee = nowFeeConfig.maximumFee
  const expirationTime: number | undefined =
    epochInfo.epoch < feeConfig.newerTransferFee.epoch
      ? ((Number(feeConfig.newerTransferFee.epoch) * epochInfo.slotsInEpoch - epochInfo.absoluteSlot) * 400) / 1000
      : undefined

  if (addFee) {
    if (nowFeeConfig.transferFeeBasisPoints === POINT) {
      const nowMaxFee = nowFeeConfig.maximumFee
      return {
        amount: add(amount, nowMaxFee),
        fee: nowMaxFee,
        expirationTime,
      }
    } else {
      const _TAmount = BNDivCeil(toSDKBN(amount).mul(new BN(POINT)), new BN(POINT - nowFeeConfig.transferFeeBasisPoints))

      const nowMaxFee = new BN(nowFeeConfig.maximumFee.toString())
      const TAmount = _TAmount.sub(amountSDKBN).gt(nowMaxFee) ? amountSDKBN.add(nowMaxFee) : _TAmount

      const _fee = parseSDKBN(BNDivCeil(TAmount.mul(new BN(nowFeeConfig.transferFeeBasisPoints)), new BN(POINT)))
      const fee = _fee > maxFee ? maxFee : _fee
      return {
        amount: parseSDKBN(TAmount),
        fee,
        expirationTime,
      }
    }
  } else {
    const _fee = parseSDKBN(BNDivCeil(amountSDKBN.mul(new BN(nowFeeConfig.transferFeeBasisPoints)), new BN(POINT)))
    const fee = _fee > maxFee ? maxFee : _fee

    return {
      amount,
      fee,
      expirationTime,
    }
  }
}
