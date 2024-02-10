import { Numberish } from '@edsolater/fnkit'
import { Token } from '../../../utils/dataStructures/Token'
import { TokenAmount } from '../../../utils/dataStructures/TokenAmount'
import { Percent, PublicKey } from '../../../utils/dataStructures/type'
import {
  ApiClmmPoolsItem as SDK_ApiClmmPoolsItem,
  ClmmPoolInfo as SDK_ClmmPoolInfo,
  ClmmPoolPersonalPosition as SDK_ClmmPoolPersonalPosition,
} from '@raydium-io/raydium-sdk'

export type JsonClmm = SDK_ApiClmmPoolsItem
export type JsonClmmFile = { data: JsonClmm[] }
export type APIClmmInfo = JsonClmm
export type SDKClmmInfo = {
  state: SDK_ClmmPoolInfo
  positionAccount?: SDK_ClmmPoolPersonalPosition[]
}
export type ClmmInfo = {
  protocolFeeRate: Percent
  tradeFeeRate: Percent
  base: Token | undefined
  quote: Token | undefined
  liquidity: Numberish
  id: PublicKey
  userPositionAccount?: ClmmUserPositionAccount[]
  name: string
  idString: string
  creator: PublicKey

  ammConfig: ClmmConfigInfo
  currentPrice: Numberish
  rewardInfos: ClmmRewardInfo[]
  tvl: TokenAmount
  feeApr24h: Percent
  feeApr7d: Percent
  feeApr30d: Percent
  totalApr24h: Percent
  totalApr7d: Percent
  totalApr30d: Percent

  volume24h: TokenAmount
  volume7d: TokenAmount
  volume30d: TokenAmount

  fee24hA: TokenAmount
  fee24hB: TokenAmount
  fee7dA: TokenAmount
  fee7dB: TokenAmount
  fee30dA: TokenAmount
  fee30dB: TokenAmount

  volumeFee24h: TokenAmount
  volumeFee7d: TokenAmount
  volumeFee30d: TokenAmount

  rewardApr24h: Percent[]
  rewardApr7d: Percent[]
  rewardApr30d: Percent[]

  // getApr({ timeBasis }: { timeBasis: '24h' | '7d' | '30d' }): {
  //   fee: {
  //     apr: Percent
  //     percentInTotal: Percent
  //   }
  //   rewards: { apr: Percent; percentInTotal: Percent; token: Token | undefined }[]
  //   apr: Percent
  // }
  // getTickApr(args: Omit<GetAprPoolTickParameters, 'ammPoolInfo' | 'poolRewardTokens'>): {
  //   fee: {
  //     apr: Percent
  //     percentInTotal: Percent
  //   }
  //   rewards: { apr: Percent; percentInTotal: Percent; token: Token | undefined }[]
  //   apr: Percent
  // }
}

export interface ClmmRewardInfo {
  rewardToken: Token | undefined
  rewardState: number
  openTime: number
  endTime: number
  lastUpdateTime: number
  rewardTotalEmissioned: TokenAmount | undefined
  rewardClaimed: TokenAmount | undefined
  tokenMint: PublicKey
  tokenVault: PublicKey
  creator: PublicKey
  perSecond: Numberish
  rewardPerWeek: TokenAmount | undefined
  rewardPerDay: TokenAmount | undefined
  remainingRewards?: Numberish
}

export interface ClmmConfigInfo {
  id: PublicKey
  index: number
  protocolFeeRate: number
  tradeFeeRate: number
  tickSpacing: number
  fundFeeRate: number
  fundOwner: string
  description: string
}

export interface ClmmUserPositionAccount {
  rewardInfos: {
    token: Token | undefined
    penddingReward: TokenAmount | undefined
    apr24h: Percent
    apr7d: Percent
    apr30d: Percent
  }[]
  inRange: boolean
  poolId: PublicKey
  nftMint: PublicKey
  priceLower: Numberish
  priceUpper: Numberish
  amountA?: TokenAmount
  amountB?: TokenAmount
  originAmountA?: TokenAmount
  originAmountB?: TokenAmount
  tokenA?: Token
  tokenB?: Token
  leverage: number
  tickLower: number
  tickUpper: number
  positionPercentA: Percent
  positionPercentB: Percent
  tokenFeeAmountA?: TokenAmount
  tokenFeeAmountB?: TokenAmount
  // getLiquidityVolume(tokenPrices: Record<string, Price>): {
  //   wholeLiquidity: Numberish | undefined
  //   baseLiquidity: Numberish | undefined
  //   quoteLiquidity: Numberish | undefined
  // }
  // getApr(args: Omit<GetAprPositionParameters, 'positionAccount' | 'ammPoolInfo' | 'poolRewardTokens'>): {
  //   fee: {
  //     apr: Percent
  //     percentInTotal: Percent
  //   }
  //   rewards: { apr: Percent; percentInTotal: Percent; token: Token | undefined }[]
  //   apr: Percent
  // }
  liquidityBN: Numberish // currently useless
  // feeGrowthInsideLastX64A: BN__default; // currently useless
  // feeGrowthInsideLastX64B: BN__default; // currently useless
  // tokenFeesOwedA: BN__default; // currently useless
  // tokenFeesOwedB: BN__default; // currently useless
}
