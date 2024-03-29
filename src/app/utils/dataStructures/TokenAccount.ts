import {
  GetTokenAccountsByOwnerConfig,
  SPL_ACCOUNT_LAYOUT,
  Spl,
  TokenAccount as _TokenAccount,
} from "@raydium-io/raydium-sdk"
import { Connection } from "@solana/web3.js"
import { parseSDKBN } from "./BN"
import { toPub, toPubString } from "./Publickey"
import { TOKEN_PROGRAM_ID } from "../../stores/data/token/utils"
import { getConnection } from "../../stores/data/connection/getConnection"
import { SOLMint } from "../../configs/wellKnownMints"
import type { PublicKey } from "./type"
import { listToRecord } from "@edsolater/fnkit"

export interface TokenAccount {
  programId: string
  isAssociated?: boolean // is ATA
  mint: string
  publicKey: string
  amount: bigint
  isNative: boolean // only SOL is true
}
export type SDK_TokenAccount = _TokenAccount

/**
 * Converts a TokenAccount to a SDK TokenAccount.
 * @param account The TokenAccount to convert.
 * @returns The converted _TokenAccount or undefined if the publicKey is null.
 */
export function toSDKTokenAccount(account: TokenAccount): _TokenAccount | undefined {
  return account.publicKey != null ? SDKTokenAccountCache.get(account.publicKey)?.account : undefined
}

export function toUITokenAccount(account: _TokenAccount): TokenAccount | undefined {
  return TokenAccountCache.get(toPubString(account.pubkey))?.account ?? undefined
}

/** store token account  */
const queriedOwner = new Map<
  string /* owner */,
  { tokenAccounts: Record<PublicKey, TokenAccount>; sdkTokenAccounts: _TokenAccount[] }
>()
const TokenAccountCache = new Map<string /* tokenAccount pubkey */, { owner: string; account: TokenAccount }>()
const SDKTokenAccountCache = new Map<string /* tokenAccount pubkey */, { owner: string; account: _TokenAccount }>()

export function ownerHasStoredTokenAccounts({ owner }: { owner: string }) {
  return queriedOwner.has(owner)
}

/**
 * core logic
 * just relay on connection
 */
export async function getTokenAccounts({
  connection: c,
  owner,
  config,
}: {
  connection: Connection | string
  owner: string
  config?: GetTokenAccountsByOwnerConfig
}): Promise<{ tokenAccounts: Record<PublicKey, TokenAccount>; sdkTokenAccounts: _TokenAccount[] }> {
  const connection = getConnection(c)
  if (ownerHasStoredTokenAccounts({ owner })) {
    return queriedOwner.get(owner)!
  } else {
    const solReq = connection.getAccountInfo(toPub(owner), config?.commitment)
    const tokenReq = connection.getTokenAccountsByOwner(
      toPub(owner),
      { programId: toPub(TOKEN_PROGRAM_ID) },
      config?.commitment,
    )

    const [solResp, tokenResp] = await Promise.all([solReq, tokenReq])

    const tokenAccounts: TokenAccount[] = []
    const sdkTokenAccounts: _TokenAccount[] = []

    for (const { pubkey, account } of tokenResp.value) {
      // double check layout length
      if (account.data.length !== SPL_ACCOUNT_LAYOUT.span) {
        console.error("invalid token account layout length", "publicKey", pubkey.toBase58())
        break
      }

      const rawResult = SPL_ACCOUNT_LAYOUT.decode(account.data)
      const { mint, amount } = rawResult

      const associatedTokenAddress = Spl.getAssociatedTokenAccount({
        mint,
        owner: toPub(owner),
        programId: account.owner,
      })
      tokenAccounts.push({
        programId: account.owner.toBase58(),
        publicKey: toPubString(pubkey),
        mint: toPubString(mint),
        isAssociated: associatedTokenAddress.equals(pubkey),
        amount: parseSDKBN(amount),
        isNative: false,
      })
      sdkTokenAccounts.push({ pubkey, accountInfo: rawResult, programId: account.owner })
    }

    tokenAccounts.push({
      programId: TOKEN_PROGRAM_ID,
      amount: BigInt(solResp ? solResp.lamports : 0),
      mint: SOLMint,
      publicKey: owner,
      isNative: true,
    })

    // set cache
    tokenAccounts.forEach(
      (account) => account.publicKey && TokenAccountCache.set(account.publicKey, { owner, account }),
    )
    sdkTokenAccounts.forEach((account) => SDKTokenAccountCache.set(account.pubkey.toString(), { owner, account }))
    queriedOwner.set(owner, { tokenAccounts: listToRecord(tokenAccounts, (i) => i.publicKey), sdkTokenAccounts })

    return { tokenAccounts: listToRecord(tokenAccounts, (i) => i.publicKey), sdkTokenAccounts }
  }
}
