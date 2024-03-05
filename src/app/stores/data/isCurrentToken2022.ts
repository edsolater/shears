import { type Tokenable } from "./token/type"
import { getCurrentToken } from "./token/getCurrentToken"

/**
 * check whether token is Token2022
 * !!! check inner token state
 */
export default function isCurrentToken2022(tokenMint: Tokenable): boolean {
  const token = getCurrentToken(tokenMint)
  return token?.extensions?.version === "TOKEN2022"
}
