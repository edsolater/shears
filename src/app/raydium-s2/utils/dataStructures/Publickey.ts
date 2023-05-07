import { isString, tryCatch } from '@edsolater/fnkit'
import { PublicKeyish } from '@raydium-io/raydium-sdk'
import { PublicKey } from '@solana/web3.js'

const mintCache = new WeakMap<PublicKey, string>()

//TODO: no token
export default function toPubString(mint: undefined | null): undefined
export default function toPubString(mint: PublicKeyish): string
export default function toPubString(mint: PublicKeyish | undefined | null): string | undefined
export default function toPubString(mint: PublicKeyish | undefined | null): string | undefined {
  if (!mint) return undefined
  if (isString(mint)) return mint
  if (mintCache.has(mint)) {
    return mintCache.get(mint)!
  } else {
    const mintString = mint.toBase58()
    mintCache.set(mint, mintString)
    return mintString
  }
}

// TODO: use mintCache
export function toPub(mint: PublicKeyish): PublicKey
export function toPub(mint: undefined): undefined
export function toPub(mint: PublicKeyish | undefined): PublicKey | undefined
export function toPub(mint: PublicKeyish | undefined): PublicKey | undefined {
  if (!mint) return undefined
  return new PublicKey(mint)
}

export function tryToPub<T>(v: T): T | PublicKey {
  return isString(v)
    ? tryCatch(
        () => new PublicKey(v),
        () => v
      )
    : v
}

/**
 * just push the result to cache
 */
export function recordPubString(...args: Parameters<typeof toPubString>): void {
  toPubString(...args)
}

export function isPublicKey(v: unknown): v is PublicKey {
  return v instanceof PublicKey
}
