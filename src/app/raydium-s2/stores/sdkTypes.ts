import { BN, PublicKey } from '../utils/dataStructures/type'

export type SDKSplAccount = {
  owner: PublicKey
  state: number
  mint: PublicKey
  amount: BN
  delegateOption: number
  delegate: PublicKey
  isNativeOption: number
  isNative: BN
  delegatedAmount: BN
  closeAuthorityOption: number
  closeAuthority: PublicKey
}
