import { Token } from "../../../utils/dataStructures/Token"

export type TokenWorkerData = {
  tokens: Token[]
  blacklist: string[]
}

export type FetchRaydiumTokenListOptions = {
  url: string
  force?: boolean
}

export interface RaydiumTokenListJsonFile {
  official: Token[]
  unOfficial: Token[]
  unNamed: Token[]
  blacklist: string[]
}

export type TokenListStore = {
  isTokenLoading?: boolean
  allTokens?: Token[]
}
