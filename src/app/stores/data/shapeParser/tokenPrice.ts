import { get } from '@edsolater/fnkit'
import { createMemo, type Accessor } from 'solid-js'
import { useShuckValue } from '../../../../packages/conveyor/solidjsAdapter/useShuck'
import type { Price } from '../../../utils/dataStructures/type'
import { shuck_tokenPrices } from '../store'
import { useToken, type TokenQueryParam } from './token'

/**
 * use this in .tsx
 * easy to use & easy to read
 * turn a short info (only tokenPrice'mint) into rich
 * whether loaded or not, it will return a tokenPrice (even emptyTokenPrice)
 *
 * it use solidjs's createStore to store a object data
 */
export function useTokenPrice(params?: TokenQueryParam): Accessor<Price | undefined> {
  const token = useToken(params)
  const pricesMap = useShuckValue(shuck_tokenPrices)
  const price = createMemo(() => {
    const prices = pricesMap()
    return get(prices, token.mint)
  })
  return price
}

// /**
//  * use this in .ts
//  */
// export function getTokenPrice(input?: UseTokenPriceParam): Subscribable<TokenPrice> {
//   const inputTokenPrice = shuck_tokenPrices.pipe((tokenPrices) => {
//     const inputParam = shrinkFn(input)
//     if (isString(inputParam)) {
//       const mint = inputParam
//       return get(tokenPrices, mint)
//     } else {
//       const tokenPrice = inputParam
//       return tokenPrice
//     }
//   })

//   const outputTokenPrice = inputTokenPrice.pipe((newTokenPrice) => newTokenPrice ?? defaultTokenPrice())
//   function updateTokenPrice() {
//     const newTokenPrice = inputTokenPrice()
//     if (newTokenPrice) {
//       if (newTokenPrice !== outputTokenPrice()) {
//         outputTokenPrice.set(newTokenPrice)
//       }
//     } else if (shuck_isTokenPriceListLoading()) {
//       outputTokenPrice.set(loadingTokenPrice)
//     } else if (shuck_isTokenPriceListLoadingError()) {
//       outputTokenPrice.set(errorTokenPrice)
//     }
//   }
//   inputTokenPrice.subscribe(updateTokenPrice)
//   shuck_isTokenPriceListLoading.subscribe(updateTokenPrice)
//   shuck_isTokenPriceListLoadingError.subscribe(updateTokenPrice)

//   return outputTokenPrice
// }

// /** not reactable!! use this in .tsx|.ts  */
// export function getCurrentTokenPrice(input?: UseTokenPriceParam): TokenPrice | undefined {
//   const outputTokenPriceSubscribable = getTokenPrice(input)
//   return outputTokenPriceSubscribable()
// }
