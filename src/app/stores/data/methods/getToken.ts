import { store } from '../dataStore'

/**
 * @todo should link to a proxy that may return when token is aviliable in future
 */
export function getToken(mint: string | undefined) {
  return mint ? store.tokens?.get(mint) : undefined
}
