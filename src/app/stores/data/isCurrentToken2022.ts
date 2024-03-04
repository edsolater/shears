import { type TokenQueryParam, getCurrentToken } from "./shapeParser/token";

/**
 * check whether token is Token2022
 * !!! check inner token state
 */
export default function isCurrentToken2022(tokenMint: TokenQueryParam): boolean {
  const token = getCurrentToken(tokenMint);
  return token?.extensions?.version === 'TOKEN2022';
}

