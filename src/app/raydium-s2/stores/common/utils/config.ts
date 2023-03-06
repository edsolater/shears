import { map } from '@edsolater/fnkit'
import { PublicKey } from '@solana/web3.js'
// import { ENDPOINT, MAINNET_PROGRAM_ID, RAYDIUM_MAINNET } from '@raydium-io/raydium-sdk'
import toPubString from './pub'

//#region ------------------- 💩 temporary fix -------------------
const TEMPORARY_RAYDIUM_MAINNET = {
  // since directly import RAYDIUM_MAINNET from '@raydium-io/raydium-sdk' will cause error
  time: '/v2/main/chain/time',
  info: '/v2/main/info',
  pairs: '/v2/main/pairs',
  price: '/v2/main/price',
  rpcs: '/v2/main/rpcs',
  version: '/v2/main/version',
  farmApr: '/v2/main/farm/info',
  farmAprLine: '/v2/main/farm-apr-tv',
  tokenInfo: '/v2/sdk/token/raydium.mainnet.json',
  poolInfo: '/v2/sdk/liquidity/mainnet.json',
  farmInfo: '/v2/sdk/farm-v2/mainnet.json',
  idoInfo: '/v2/main/ido/pools',
  idoProjectInfo: '/v2/main/ido/project/<id>',
  // CLMM
  ammV3Pools: '/v2/ammV3/ammPools',
  ammV3Configs: '/v2/ammV3/ammConfigs',
  ammV3PositionLine: '/v2/ammV3/positionLine/<poolId>'
}
const TEMPORARY_MAINNET_PROGRAM_ID = {
  // since directly import MAINNET_PROGRAM_ID from '@raydium-io/raydium-sdk' will cause error
  SERUM_MARKET: new PublicKey('9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin'),
  OPENBOOK_MARKET: new PublicKey('srmqPvymJeFKQ4zGQed1GFppgkRHL9kaELCbyksJtPX'),

  UTIL1216: new PublicKey('CLaimxFqjHzgTJtAGHU47NPhg6qrc5sCnpC4tBLyABQS'),

  FarmV3: new PublicKey('EhhTKczWMGQt46ynNeRX1WfeagwwJd7ufHvCDjRxjo5Q'),
  FarmV5: new PublicKey('9KEPoZmtHUrBbhWN1v1KWLMkkvwY6WLtAVUCPRtRjP4z'),
  FarmV6: new PublicKey('FarmqiPv5eAj3j1GMdMCMUGXqPUvmquZtMy86QH6rzhG'),

  AmmV4: new PublicKey('675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8'),
  AmmStable: new PublicKey('5quBtoiQqxF9Jv6KYKctB59NT3gtJD2Y65kdnB1Uev3h'),

  CLMM: new PublicKey('CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK')
}
const TEMPORARY_ENDPOINT = 'https://api.raydium.io' // since directly import ENDPOINT from '@raydium-io/raydium-sdk' will cause error

//#endregion

const apiTailUrls = TEMPORARY_RAYDIUM_MAINNET
const apiBase = TEMPORARY_ENDPOINT

export const appApiUrls = map(apiTailUrls, (url) => apiBase + url) as {
  [key in keyof typeof apiTailUrls]: `${typeof apiBase}${(typeof apiTailUrls)[key]}`
}
export const appProgramId = map(TEMPORARY_MAINNET_PROGRAM_ID, toPubString)
export const appRpcEndpointUrl = 'https://rpc.asdf1234.win'
