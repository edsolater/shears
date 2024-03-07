/**************************************************************************
 * 
 * @tags TxHandler misc
 * 
 **************************************************************************/
import { BNDivCeil, type CurrencyAmount } from "@raydium-io/raydium-sdk"
import type { TransferFee, TransferFeeConfig } from "@solana/spl-token"
import type { EpochInfo, TokenAmount } from "@solana/web3.js"
import BN from "bn.js"

export interface GetTransferAmountFee {
  amount: BN
  fee: BN | undefined
  expirationTime: number | undefined
}
interface TransferAmountFee {
  amount: TokenAmount | CurrencyAmount
  fee: TokenAmount | CurrencyAmount | undefined
  expirationTime: number | undefined
}
const POINT = 10_000
export function getTransferAmountFee(
  amount: BN,
  feeConfig: TransferFeeConfig | undefined,
  epochInfo: EpochInfo,
  addFee: boolean,
): GetTransferAmountFee {
  if (feeConfig === undefined) {
    return {
      amount,
      fee: undefined,
      expirationTime: undefined,
    }
  }

  const nowFeeConfig: TransferFee =
    epochInfo.epoch < feeConfig.newerTransferFee.epoch ? feeConfig.olderTransferFee : feeConfig.newerTransferFee
  const maxFee = new BN(nowFeeConfig.maximumFee.toString())
  const expirationTime: number | undefined =
    epochInfo.epoch < feeConfig.newerTransferFee.epoch
      ? ((Number(feeConfig.newerTransferFee.epoch) * epochInfo.slotsInEpoch - epochInfo.absoluteSlot) * 400) / 1000
      : undefined

  if (addFee) {
    if (nowFeeConfig.transferFeeBasisPoints === POINT) {
      const nowMaxFee = new BN(nowFeeConfig.maximumFee.toString())
      return {
        amount: amount.add(nowMaxFee),
        fee: nowMaxFee,
        expirationTime,
      }
    } else {
      const _TAmount = BNDivCeil(amount.mul(new BN(POINT)), new BN(POINT - nowFeeConfig.transferFeeBasisPoints))

      const nowMaxFee = new BN(nowFeeConfig.maximumFee.toString())
      const TAmount = _TAmount.sub(amount).gt(nowMaxFee) ? amount.add(nowMaxFee) : _TAmount

      const _fee = BNDivCeil(TAmount.mul(new BN(nowFeeConfig.transferFeeBasisPoints)), new BN(POINT))
      const fee = _fee.gt(maxFee) ? maxFee : _fee
      return {
        amount: TAmount,
        fee,
        expirationTime,
      }
    }
  } else {
    const _fee = BNDivCeil(amount.mul(new BN(nowFeeConfig.transferFeeBasisPoints)), new BN(POINT))
    const fee = _fee.gt(maxFee) ? maxFee : _fee

    return {
      amount,
      fee,
      expirationTime,
    }
  }
}
