import { ApiFarmApr } from "@raydium-io/raydium-sdk"

export type FetchFarmsOptions = {
  apiUrl: string
  force?: boolean
  owner?: string
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
  lpMint: string
  lpVault: string

  baseMint: string
  quoteMint: string
  name: string

  version: number
  programId: string

  authority: string
  creator?: string
  rewardInfos: FarmAPIRewardInfo[]
  upcoming: boolean

  rewardPeriodMin?: number // v6 '7-90 days's     7 * 24 * 60 * 60 seconds
  rewardPeriodMax?: number // v6 '7-90 days's     90 * 24 * 60 * 60 seconds
  rewardPeriodExtend?: number // v6 'end before 72h's    72 * 60 * 60 seconds

  local: boolean // only if it is in localstorage(create just by user)
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