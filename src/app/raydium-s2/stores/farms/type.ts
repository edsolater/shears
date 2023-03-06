import { UnionCover } from '@edsolater/fnkit'
import BN from 'bn.js'
import {
  ApiFarmApr,
  FarmFetchMultipleInfoReturnItem,
  FarmStateV3,
  FarmStateV5,
  FarmStateV6,
  SplAccount
} from '@raydium-io/raydium-sdk'
import { Connection, PublicKey } from '@solana/web3.js'

export type FetchFarmsJsonPayloads = {
  url: string
  force?: boolean
}

export type FetchFarmsSDKInfoPayloads = {
  rpcUrl: string
  owner: string
}

export interface FarmAPIRewardInfo {
  rewardMint: string
  rewardVault: string
  rewardOpenTime: number
  rewardEndTime: number
  rewardPerSecond: string | number
  rewardSender?: string
  rewardType: 'Standard SPL' | 'Option tokens'
}

export type FarmPoolAprJsonInfo = ApiFarmApr

export interface FarmPoolJsonInfo {
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
  rewardInfos: FarmAPIRewardInfo[]
  upcoming: boolean

  rewardPeriodMin?: number // v6 '7-90 days's     7 * 24 * 60 * 60 seconds
  rewardPeriodMax?: number // v6 '7-90 days's     90 * 24 * 60 * 60 seconds
  rewardPeriodExtend?: number // v6 'end before 72h's    72 * 60 * 60 seconds

  local?: boolean // only if it is in localstorage(create just by user)
  category: 'stake' | 'raydium' | 'fusion' | 'ecosystem' // add by UI for unify the interface
}

export type FarmPoolsJsonFile = {
  name: string
  version: unknown
  stake: Omit<FarmPoolJsonInfo, 'category'>[]
  raydium: Omit<FarmPoolJsonInfo, 'category'>[]
  fusion: Omit<FarmPoolJsonInfo, 'category'>[]
  ecosystem: Omit<FarmPoolJsonInfo, 'category'>[]
}

export type SdkParsedFarmInfo = UnionCover<
  FarmPoolJsonInfo,
  SdkParsedFarmInfoBase &
    ({ version: 6; state: FarmStateV6 } | { version: 3; state: FarmStateV3 } | { version: 5; state: FarmStateV5 })
> & { jsonInfo: FarmPoolJsonInfo; fetchedMultiInfo: FarmFetchMultipleInfoReturnItem }

type SdkParsedFarmInfoBase = {
  jsonInfo: FarmPoolJsonInfo
  id: PublicKey
  lpMint: PublicKey
  programId: PublicKey
  authority: PublicKey
  lpVault: SplAccount
  rewardInfos: APIRewardInfo[]
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

interface APIRewardInfo {
  rewardMint: string
  rewardVault: string
  rewardOpenTime: number
  rewardEndTime: number
  rewardPerSecond: string | number
  rewardSender?: string
  rewardType: 'Standard SPL' | 'Option tokens'
}
