import { mapEntry, shakeFalsy, shakeNil } from "@edsolater/fnkit"
import { parallelAsyncTasks, recordToMap } from "../../../../packages/fnkit"
import { jFetch } from "../../../../packages/jFetch"
import type { Mint, Price } from "../../../utils/dataStructures/type"
import type { TokenListStore } from "../types/tokenList"

export type TokenPricesMap = Map<Mint, Price>

export async function fetchTokenPrices(tokens: TokenListStore["tokens"], raydiumUrl: string): Promise<TokenPricesMap> {
  type CoingeckoPriceFile = Record<string /* coingeckoid */, { usd?: number }>
  type RaydiumPriceFile = Record<string, number>
  if (!tokens || tokens.length === 0) return new Map()
  const coingeckoIds = shakeFalsy(Array.from(tokens.values()).map((t) => t?.extensions?.coingeckoId))
  const [coingeckoPrices, raydiumPrices] = await parallelAsyncTasks([
    jFetch<CoingeckoPriceFile>(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coingeckoIds}&vs_currencies=usd`,
    ).then((coingeckoPrices) => {
      const coingeckoIdMap = Object.fromEntries(tokens.map((t) => [t.mint, t.extensions?.coingeckoId]))
      const reversedCoingeckoIdMap = new Map(Object.entries(coingeckoIdMap).map(([k, v]) => [v, k]))
      const coingeckoTokenPrices = coingeckoPrices
        ? mapEntry(coingeckoPrices, (value, key) => [reversedCoingeckoIdMap.get(key), value.usd])
        : undefined
      return coingeckoTokenPrices
    }),
    jFetch<RaydiumPriceFile>(raydiumUrl),
  ])
  const prices = recordToMap(shakeNil({ ...coingeckoPrices, ...raydiumPrices }))
  return prices
}
