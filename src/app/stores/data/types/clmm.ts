import type { Numberish } from "@edsolater/fnkit"
import type {
  ApiClmmPoolsItem as SDK_ApiClmmPoolsItem,
  ClmmPoolInfo as SDK_ClmmPoolInfo,
  ClmmPoolPersonalPosition as SDK_ClmmPoolPersonalPosition,
} from "@raydium-io/raydium-sdk"
import type { Amount } from "../../../utils/dataStructures/TokenAmount"
import type { Mint, Percent, Price, PublicKey } from "../../../utils/dataStructures/type"

export type ClmmJsonInfo = SDK_ApiClmmPoolsItem
export type ClmmJsonFile = { data: ClmmJsonInfo[] }
export type ClmmSDKInfo = {
  state: SDK_ClmmPoolInfo
  positionAccount?: SDK_ClmmPoolPersonalPosition[]
}
export type ClmmInfo = {
  hasLoadJsonApi: boolean
  hasLoadSdk: boolean
  id: PublicKey
  liquidity?: Numberish // info from SDK
  tvl?: Amount // info from SDK
  protocolFeeRate?: Percent // info from SDK
  tradeFeeRate?: Percent // info from SDK
  base: Mint
  baseProgramId: PublicKey
  baseDecimals: number
  quote: Mint
  quoteProgramId: PublicKey
  quoteDecimals: number
  userPositionAccounts?: ClmmUserPositionAccount[] // info from SDK
  // idString: string
  creator?: PublicKey // info from SDK

  ammConfig: ClmmConfigInfo
  currentPrice?: Price // info from SDK
  rewardInfos: ClmmRewardInfo[]
  feeApr?: {
    // info from SDK
    "24h": Percent
    "7d": Percent
    "30d": Percent
  }
  totalApr?: {
    // info from SDK
    "24h": Percent
    "7d": Percent
    "30d": Percent
  }
  volume?: {
    // info from SDK
    "24h": Percent
    "7d": Percent
    "30d": Percent
  }
  fee?: {
    base: {
      "24h": Amount
      "7d": Amount
      "30d": Amount
    }
    quote: {
      "24h": Amount
      "7d": Amount
      "30d": Amount
    }
  }
  volumeFee?: {
    "24h": Amount
    "7d": Amount
    "30d": Amount
  }

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
  tokenMint: Mint
  tokenProgramId: PublicKey

  creator?: PublicKey // info from SDK
  stateCode?: number // info from SDK
  openTime?: number /* timestamp */ // info from SDK
  endTime?: number /* timestamp */ // info from SDK
  lastUpdateTime?: number /* timestamp */ // info from SDK
  claimed?: Amount // info from SDK
  totalEmissioned?: Amount // info from SDK
  remainingRewards?: Amount // info from SDK

  perSecondBN?: Numberish // info from SDK
  perDayBN?: Numberish // info from SDK
  perWeekBN?: Numberish // info from SDK

  apr?: {
    "24h": Percent // info from SDK
    "7d": Percent // info from SDK
    "30d": Percent // info from SDK
  }
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

/** only contain unHydrated data which is 'dry' */
export interface ClmmUserPositionAccount {
  rewardInfos: {
    token: Mint | undefined
    penddingReward: Amount | undefined
  }[]
  liquidity: Numberish
  inRange: boolean
  poolId: PublicKey
  nftMint: PublicKey
  priceLower: Numberish
  priceUpper: Numberish
  amountBaseBN?: Amount
  amountQuoteBN?: Amount
  tokenBase?: Mint
  tokenQuote?: Mint
  leverage: number
  tickLower: number
  tickUpper: number
  positionPercentBase: Percent
  positionPercentQuote: Percent
  tokenFeeAmountBase?: Amount
  tokenFeeAmountQuote?: Amount
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
  // feeGrowthInsideLastX64A: BN__default; // currently useless
  // feeGrowthInsideLastX64B: BN__default; // currently useless
  // tokenFeesOwedA: BN__default; // currently useless
  // tokenFeesOwedB: BN__default; // currently useless
}
