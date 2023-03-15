import { Numberish } from '@edsolater/fnkit'
import { ApiFarmApr } from '@raydium-io/raydium-sdk'
import { BN } from '../../utils/dataStructures/BN'
import { Mint, Percent, Price, PublicKey, TokenAmount } from '../../utils/dataStructures/type'

export type FetchFarmsJSONPayloads = {
  url: string
  force?: boolean
}

export type FetchFarmsSYNInfoPayloads = {
  farmApiUrl: string
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

export type FarmSYNInfo = {
  baseMint: Mint
  quoteMint: Mint
  lpMint: Mint
  lpPrice: Price

  id: PublicKey
  name: string
  ammId: PublicKey
  programId: PublicKey
  authority: PublicKey
  category: 'stake' | 'raydium' | 'fusion' | 'ecosystem' // add by UI for unify the interface

  /** only for v3/v5 */
  isDualFusionPool: boolean
  isNormalFusionPool: boolean
  isClosedPool: boolean
  isStakePool: boolean
  isUpcomingPool: boolean
  isStablePool: boolean
  /** new pool shoud sort in highest  */
  isNewPool: boolean

  totalApr: {
    '7d': Percent
    '30d': Percent
    '24h': Percent
  }
  raydiumFeeApr: {
    // raydium fee for each transaction
    '7d': Percent
    '30d': Percent
    '24h': Percent
  }

  tvl: Numberish

  userHasStaked: boolean
  rewards: {
    userHavedReward: boolean
    apr: Percent | undefined // farm's rewards apr
    token: Mint | undefined
    /** only when user have deposited and connected wallet */
    userPendingReward: TokenAmount | undefined
    version: 3 /* closed reward */ | 5 /* open reward */ | 6 /* upcoming reward */
    rewardVault: PublicKey
    openTime?: Date // v6
    endTime?: Date // v6
    // this reward is sent by who
    sender?: PublicKey // v6

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
    type: 'Standard SPL' | 'Option tokens' // v6
  }[]
  userStakedLpAmount: TokenAmount
  stakedLpAmount: TokenAmount

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
