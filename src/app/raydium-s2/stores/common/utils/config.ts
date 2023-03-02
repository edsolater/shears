import { map } from '@edsolater/fnkit'
import { ALL_PROGRAM_ID, API_URLS } from 'test-raydium-sdk-v2'

const apiTailUrls = API_URLS
const apiBase = 'https://api.raydium.io/v2'

export const appApiUrls = map(apiTailUrls, (url) => apiBase + url)
export const appProgramId = ALL_PROGRAM_ID
export const appRpcEndpointUrl = 'https://rpc.asdf1234.win'
