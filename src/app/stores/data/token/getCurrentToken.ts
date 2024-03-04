import { type Token } from './type';
import { getTokenSubscribable } from './getTokenSubscribable';
import { TokenQueryParam } from './type';

/** not reactable!! use this in .tsx|.ts  */

export function getCurrentToken(input?: TokenQueryParam): Token | undefined {
  const outputTokenSubscribable = getTokenSubscribable(input);
  return outputTokenSubscribable();
}
