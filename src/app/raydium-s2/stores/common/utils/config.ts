import { map } from '@edsolater/fnkit'
import { ENDPOINT, MAINNET_PROGRAM_ID, RAYDIUM_MAINNET } from '@raydium-io/raydium-sdk'
import toPubString from './pub'

const apiTailUrls = RAYDIUM_MAINNET
const apiBase = ENDPOINT

export const appApiUrls = map(apiTailUrls, (url) => apiBase + url) as {
  [key in keyof typeof apiTailUrls]: `${typeof apiBase}${typeof apiTailUrls[key]}`
}
export const appProgramId = map(MAINNET_PROGRAM_ID, toPubString)
export const appRpcEndpointUrl = 'https://rpc.asdf1234.win'
