// new AMM pool (CLMM)
export interface ApiAmmV3ConfigItem {
  id: string
  index: number
  protocolFeeRate: number
  tradeFeeRate: number
  tickSpacing: number
  fundFeeRate: number
  fundOwner: string
  description: string
}

export interface ApiAmmV3Config {
  data: { [id: string]: ApiAmmV3ConfigItem }
}
export interface ApiAmmV3PoolsItemStatistics {
  volume: number
  volumeFee: number
  feeA: number
  feeB: number
  feeApr: number
  rewardApr: {
    A: number
    B: number
    C: number
  }
  apr: number
  priceMin: number
  priceMax: number
}
export interface ApiAmmV3PoolsItem {
  id: string
  mintA: string
  mintB: string
  vaultA: string
  vaultB: string
  mintDecimalsA: number
  mintDecimalsB: number
  ammConfig: ApiAmmV3ConfigItem
  tvl: number
  day: ApiAmmV3PoolsItemStatistics
  week: ApiAmmV3PoolsItemStatistics
  month: ApiAmmV3PoolsItemStatistics
  lookupTableAccount: string
}

// old AMM pool
export interface ApiPoolInfoV4 {
  id: string
  baseMint: string
  quoteMint: string
  lpMint: string
  baseDecimals: number
  quoteDecimals: number
  lpDecimals: number
  version: 4
  programId: string
  authority: string
  openOrders: string
  targetOrders: string
  baseVault: string
  quoteVault: string
  withdrawQueue: string
  lpVault: string
  marketVersion: 3
  marketProgramId: string
  marketId: string
  marketAuthority: string
  marketBaseVault: string
  marketQuoteVault: string
  marketBids: string
  marketAsks: string
  marketEventQueue: string
}

export interface ApiPoolInfoV5 {
  id: string
  baseMint: string
  quoteMint: string
  lpMint: string
  baseDecimals: number
  quoteDecimals: number
  lpDecimals: number
  version: 5
  programId: string
  authority: string
  openOrders: string
  targetOrders: string
  baseVault: string
  quoteVault: string
  withdrawQueue: string
  lpVault: string
  marketVersion: 3
  marketProgramId: string
  marketId: string
  marketAuthority: string
  marketBaseVault: string
  marketQuoteVault: string
  marketBids: string
  marketAsks: string
  marketEventQueue: string
  modelDataAccount: string
}

export type ApiPoolInfoItem = ApiPoolInfoV4 | ApiPoolInfoV5

export interface ApiPoolInfo {
  official: ApiPoolInfoItem[]
  unOfficial: ApiPoolInfoItem[]
}
