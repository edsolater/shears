import { createOnFirstAccess } from '../../../../../packages/pivkit'
import { loadPairs } from './loadPairs'
import { DataStore } from '../store'
import { loadTokensInfos } from './loadTokens'

export const onAccessTokens = createOnFirstAccess<DataStore>(['allTokens'], loadTokensInfos)
