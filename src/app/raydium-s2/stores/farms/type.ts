import { Numberish, ReplaceType, UnionCover } from '@edsolater/fnkit'
import {
  ApiFarmApr,
  FarmFetchMultipleInfoReturnItem,
  FarmStateV3,
  FarmStateV5,
  FarmStateV6,
  SplAccount
} from '@raydium-io/raydium-sdk'
import _BN from 'bn.js'
import { PublicKey as _PublicKey } from '@solana/web3.js'
import { BN } from '../../utils/dataStructures/BN'
import { TokenAmount, Percent, PublicKey, Price } from '../../utils/dataStructures/type'
import { Token } from '../tokenList/type'
import { SDKSplAccount } from '../sdkTypes'

export type FetchFarmsJSONPayloads = {
  url: string
  force?: boolean
}

export type FetchFarmsSDKInfoPayloads = {
  rpcUrl: string
  owner: string
}

export type FarmRewardJSONInfo = {
  rewardMint: string
  rewardVault: string
  rewardOpenTime: number
  rewardEndTime: number
  rewardPerSecond: string | number
  rewardSender?: string
  rewardType: 'Standard SPL' | 'Option tokens'
}

export type FarmAprJSONInfo = ApiFarmApr

export type FarmJSONInfo = {
  id: string
  symbol: string
  lpMint: string
  lpVault: string

  baseMint: string
  quoteMint: string

  version: number
  programId: string

  authority: string
  creator?: string
  rewardInfos: FarmRewardJSONInfo[]
  upcoming: boolean

  rewardPeriodMin?: number // v6 '7-90 days's     7 * 24 * 60 * 60 seconds
  rewardPeriodMax?: number // v6 '7-90 days's     90 * 24 * 60 * 60 seconds
  rewardPeriodExtend?: number // v6 'end before 72h's    72 * 60 * 60 seconds

  local?: boolean // only if it is in localstorage(create just by user)
  category: 'stake' | 'raydium' | 'fusion' | 'ecosystem' // add by UI for unify the interface
}

export type FarmJSONFile = {
  name: string
  version: unknown
  stake: Omit<FarmJSONInfo, 'category'>[]
  raydium: Omit<FarmJSONInfo, 'category'>[]
  fusion: Omit<FarmJSONInfo, 'category'>[]
  ecosystem: Omit<FarmJSONInfo, 'category'>[]
}

export type FarmSDKInfo = UnionCover<
  FarmJSONInfo,
  FarmSDKInfoBaseSharedPart &
    ({ version: 6; state: FarmStateV6 } | { version: 3; state: FarmStateV3 } | { version: 5; state: FarmStateV5 })
> & { jsonInfo: FarmJSONInfo; fetchedMultiInfo: FarmFetchMultipleInfoReturnItem }

export type FarmSDKInfoBaseSharedPart = {
  jsonInfo: FarmJSONInfo
  id: PublicKey
  lpMint: PublicKey
  programId: PublicKey
  authority: PublicKey
  lpVault: SDKSplAccount
  rewardInfos: FarmRewardJSONInfo[]
  /** only when user have deposited and connected wallet */
  ledger?: {
    id: PublicKey
    owner: PublicKey
    state: BN
    deposited: BN
    rewardDebts: BN[]
  }
  /** only when user have deposited and connected wallet */
  wrapped?: {
    pendingRewards: BN[]
  }
}

export type FarmSYNInfo = FarmSDKInfo & {
  lp: Token | /* staking pool */ undefined
  lpPrice: Price | undefined

  base: Token | undefined
  quote: Token | undefined
  name: string

  ammId: string | undefined

  /** only for v3/v5 */
  isDualFusionPool: boolean
  isNormalFusionPool: boolean
  isClosedPool: boolean
  isStakePool: boolean
  isUpcomingPool: boolean
  isStablePool: boolean
  /** new pool shoud sort in highest  */
  isNewPool: boolean

  /** 7d */
  totalApr7d: Percent | undefined
  /** 7d; undefined means couldn't find this token by known tokenList */
  raydiumFeeApr7d: Percent | undefined // raydium fee for each transaction

  totalApr30d: Percent | undefined
  /** undefined means couldn't find this token by known tokenList */
  raydiumFeeApr30d: Percent | undefined // raydium fee for each transaction

  totalApr24h: Percent | undefined
  /** undefined means couldn't find this token by known tokenList */
  raydiumFeeApr24h: Percent | undefined // raydium fee for each transaction

  tvl: Numberish | undefined

  userHasStaked: boolean
  rewards: FarmRewardSYNInfo[]
  userStakedLpAmount: TokenAmount | undefined
  stakedLpAmount: TokenAmount | undefined
}

export type FarmRewardSYNInfo = {
  userHavedReward: boolean
  apr: Percent | undefined // farm's rewards apr
  token: Token | undefined
  /** only when user have deposited and connected wallet */
  userPendingReward: TokenAmount | undefined
  version: 3 /* closed reward */ | 5 /* open reward */ | 6 /* upcoming reward */
  rewardVault: PublicKey
  openTime?: Date // v6
  endTime?: Date // v6

  isOptionToken?: boolean // v6
  isRewarding?: boolean // v6
  isRewardBeforeStart?: boolean // v6
  isRewardEnded?: boolean // v6
  isRwardingBeforeEnd72h?: boolean // v6

  rewardPeriodMin?: number // v6 '7-90 days's     7 * 24 * 60 * 60 seconds
  rewardPeriodMax?: number // v6 '7-90 days's     90 * 24 * 60 * 60 seconds
  rewardPeriodExtend?: number // v6 'end before 72h's    72 * 60 * 60 seconds

  claimableRewards?: TokenAmount // v6
  owner?: string // v6
  perSecond?: string | number // v6
}
