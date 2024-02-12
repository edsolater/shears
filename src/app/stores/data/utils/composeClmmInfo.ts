import { add, div, isPromise, mul, type MayPromise } from '@edsolater/fnkit'
import type { ClmmPoolPersonalPosition as SDK_ClmmPoolPersonalPosition } from '@raydium-io/raydium-sdk'
import { parseSDKBN } from '../../../utils/dataStructures/BN'
import { parseSDKDecimal } from '../../../utils/dataStructures/Decimal'
import { toPercent } from '../../../utils/dataStructures/Percent'
import toPubString from '../../../utils/dataStructures/Publickey'
import type { PublicKey } from '../../../utils/dataStructures/type'
import type { ClmmInfo, ClmmRewardInfo, ClmmUserPositionAccount, JsonClmmInfo, SDKClmmInfo } from '../types/clmm'

export function composeClmmInfos(
  apiInfo: Record<PublicKey, JsonClmmInfo>,
  sdkInfo?: Record<PublicKey, SDKClmmInfo | undefined>,
): Record<string, ClmmInfo>
export async function composeClmmInfos(
  apiInfo: MayPromise<Record<PublicKey, JsonClmmInfo>>,
  sdkInfo?: Record<PublicKey, SDKClmmInfo | undefined>,
): Promise<Record<string, ClmmInfo>>
export function composeClmmInfos(
  apiInfo: MayPromise<Record<PublicKey, JsonClmmInfo>>,
  sdkInfo?: MayPromise<Record<PublicKey, SDKClmmInfo | undefined>>,
): Promise<Record<string, ClmmInfo>> | Record<string, ClmmInfo> {
  if (isPromise(apiInfo) || isPromise(sdkInfo)) {
    return (async () => {
      const [apiInfoResolved, sdkInfoResolved] = await Promise.all([apiInfo, sdkInfo])
      return composeClmmInfos(apiInfoResolved, sdkInfoResolved)
    })()
  } else {
    const result: Record<string, ClmmInfo> = {}
    for (const [id, api] of Object.entries(apiInfo)) {
      const sdk = sdkInfo?.[id]
      if (!sdk) continue
      result[id] = composeClmmInfo(api, sdk)
    }
    return result
  }
}
export function composeClmmInfo(jsonInfo: JsonClmmInfo, sdkInfo?: SDKClmmInfo): ClmmInfo {
  const currentPrice = sdkInfo && parseSDKDecimal(sdkInfo.state.currentPrice)
  
  const userPositionAccounts = sdkInfo?.positionAccount?.map((userPositionAccount) => {
    const amountBase = parseSDKBN(userPositionAccount.amountA)
    const amountQuote = parseSDKBN(userPositionAccount.amountB)
    const innerVolumeBase = mul(currentPrice!, amountBase) ?? 0
    const innerVolumeQuote = amountQuote ?? 0
    const positionPercentBase = toPercent(div(innerVolumeBase, add(innerVolumeBase, innerVolumeQuote)))
    const positionPercentQuote = toPercent(div(innerVolumeQuote, add(innerVolumeBase, innerVolumeQuote)))
    return {
      rewardInfos: userPositionAccount.rewardInfos.map((i, idx) => ({
        token: jsonInfo.rewardInfos[idx].mint,
        penddingReward: parseSDKBN(i.pendingReward),
      })),
      liquidity: parseSDKBN(userPositionAccount.liquidity),
      inRange: checkIsInRange(sdkInfo, userPositionAccount),
      poolId: toPubString(userPositionAccount.poolId),
      nftMint: toPubString(userPositionAccount.nftMint),
      priceLower: parseSDKDecimal(userPositionAccount.priceLower),
      priceUpper: parseSDKDecimal(userPositionAccount.priceUpper),
      amountBase: amountBase,
      amountQuote: amountQuote,
      tokenFeeAmountBase: parseSDKBN(userPositionAccount.tokenFeeAmountA),
      tokenFeeAmountQuote: parseSDKBN(userPositionAccount.tokenFeeAmountB),
      tokenBase: jsonInfo.mintA,
      tokenQuote: jsonInfo.mintB,
      leverage: userPositionAccount.leverage,
      tickLower: userPositionAccount.tickLower,
      tickUpper: userPositionAccount.tickUpper,
      positionPercentBase,
      positionPercentQuote,
    } satisfies ClmmUserPositionAccount
  })

  return {
    hasLoad: sdkInfo ? ['api', 'sdk'] : ['api'],
    id: jsonInfo.id,
    liquidity: parseSDKBN(sdkInfo?.state.liquidity),
    tvl: sdkInfo?.state.tvl,
    protocolFeeRate:
      sdkInfo &&
      toPercent(div(sdkInfo.state.ammConfig.protocolFeeRate, 10 ** 4), {
        alreadyDecimaled: true,
      }),
    ammConfig: jsonInfo.ammConfig,
    base: jsonInfo.mintA,
    baseProgramId: jsonInfo.mintProgramIdA,
    baseDecimals: jsonInfo.mintDecimalsA,
    quote: jsonInfo.mintB,
    quoteProgramId: jsonInfo.mintProgramIdB,
    quoteDecimals: jsonInfo.mintDecimalsB,
    userPositionAccounts,
    creator: sdkInfo && toPubString(sdkInfo.state.creator),
    currentPrice: currentPrice,
    // change to shape
    feeApr: sdkInfo && {
      '24h': toPercent(sdkInfo.state.day.feeApr, { alreadyDecimaled: true }),
      '7d': toPercent(sdkInfo.state.week.feeApr, { alreadyDecimaled: true }),
      '30d': toPercent(sdkInfo.state.month.feeApr, { alreadyDecimaled: true }),
    },
    totalApr: sdkInfo && {
      '24h': toPercent(sdkInfo.state.day.apr, { alreadyDecimaled: true }),
      '7d': toPercent(sdkInfo.state.week.apr, { alreadyDecimaled: true }),
      '30d': toPercent(sdkInfo.state.month.apr, { alreadyDecimaled: true }),
    },
    rewardInfos: jsonInfo.rewardInfos.map(
      (i, idx) =>
        ({
          tokenMint: i.mint,
          tokenProgramId: i.programId,
          creator: sdkInfo && toPubString(sdkInfo.state.rewardInfos[idx].creator),
          stateCode: sdkInfo?.state.rewardInfos[idx].rewardState,
          openTime: sdkInfo && Number(parseSDKBN(sdkInfo.state.rewardInfos[idx].openTime)),
          endTime: sdkInfo && Number(parseSDKBN(sdkInfo.state.rewardInfos[idx].endTime)),
          lastUpdateTime: sdkInfo && Number(parseSDKBN(sdkInfo.state.rewardInfos[idx].lastUpdateTime)),
          claimed: parseSDKBN(sdkInfo?.state.rewardInfos[idx].rewardClaimed),
          totalEmissioned: parseSDKBN(sdkInfo?.state.rewardInfos[idx].rewardTotalEmissioned),
          remainingRewards: parseSDKBN(sdkInfo?.state.rewardInfos[idx].remainingRewards),
          perSecondBN: parseSDKDecimal(sdkInfo?.state.rewardInfos[idx].perSecond),
          perDayBN: parseSDKDecimal(sdkInfo?.state.rewardInfos[idx].perSecond.mul(86400)),
          perWeekBN: parseSDKDecimal(sdkInfo?.state.rewardInfos[idx].perSecond.mul(86400 * 7)),
          apr: sdkInfo && {
            '24h': toPercent(sdkInfo.state.day.rewardApr[idx == 0 ? 'A' : idx == 1 ? 'B' : 'C'], {
              alreadyDecimaled: true,
            }),
            '7d': toPercent(sdkInfo.state.week.rewardApr[idx == 0 ? 'A' : idx == 1 ? 'B' : 'C'], {
              alreadyDecimaled: true,
            }),
            '30d': toPercent(sdkInfo.state.month.rewardApr[idx == 0 ? 'A' : idx == 1 ? 'B' : 'C'], {
              alreadyDecimaled: true,
            }),
          },
        }) satisfies ClmmRewardInfo,
    ),
  }
}

function checkIsInRange(sdkInfo: SDKClmmInfo, sdkPersonalPosition: SDK_ClmmPoolPersonalPosition): boolean {
  const currentPrice = sdkInfo.state.currentPrice
  const priceLower = sdkPersonalPosition.priceLower
  const priceUpper = sdkPersonalPosition.priceUpper
  return currentPrice.gt(priceLower) && currentPrice.lt(priceUpper)
}
