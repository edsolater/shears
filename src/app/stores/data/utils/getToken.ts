import { createSubscribable, get } from '@edsolater/fnkit'
import { shuck_tokens, store } from '../store'

/**
 * @todo should link to a proxy that may return when token is aviliable in future
 */
export function getToken(mint: string | undefined) {
  return mint ? get(shuck_tokens(), mint) : undefined
}

// TODO: too complex to use, should be simplified. scribable should support `proptotype.pipe()`
export function getTokenSubscribable(mint: string | undefined) {
  const newSubscribable = createSubscribable(() => getToken(mint))
  if (mint) {
    shuck_tokens.subscribe((tokens) => {
      newSubscribable.set(get(tokens, mint))
    })
  }
  return newSubscribable
}
