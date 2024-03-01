import {
  GetTokenAccountsByOwnerConfig,
  TokenAccount as SDK_TokenAccount,
  SPL_ACCOUNT_LAYOUT,
  Spl,
} from '@raydium-io/raydium-sdk'
import { parseSDKBN } from './BN'
import { getConnection } from './Connection'
import toPubString, { toPub } from './Publickey'
import { TOKEN_PROGRAM_ID } from './Token'

export interface TokenAccount {
  programId: string
  isAssociated?: boolean // is ATA
  mint?: string
  publicKey?: string
  amount: bigint
  isNative: boolean // only SOL is true
}
export type { SDK_TokenAccount }

/**
 * Converts a TokenAccount to a SDK TokenAccount.
 * @param account The TokenAccount to convert.
 * @returns The converted _TokenAccount or undefined if the publicKey is null.
 */
export function toSDKTokenAccount(account: TokenAccount): SDK_TokenAccount | undefined {
  return account.publicKey != null ? SDKTokenAccountCache.get(toPubString(account.publicKey))?.account : undefined
}

export function toUITokenAccount(account: SDK_TokenAccount): TokenAccount | undefined {
  return TokenAccountCache.get(toPubString(account.pubkey))?.account ?? undefined
}

/** store token account  */
const queriedOwner = new Map<
  string /* owner */,
  { tokenAccounts: TokenAccount[]; sdkTokenAccounts: SDK_TokenAccount[] }
>()
const TokenAccountCache = new Map<string /* tokenAccount pubkey */, { owner: string; account: TokenAccount }>()
const SDKTokenAccountCache = new Map<string /* tokenAccount pubkey */, { owner: string; account: SDK_TokenAccount }>()

export function ownerHasStoredTokenAccounts({ owner }: { owner: string }) {
  return queriedOwner.has(owner)
}

/**
 * core logic
 * just relay on connection
 */
export async function getTokenAccounts({
  endpointUrl,
  owner,
  config,
}: {
  endpointUrl: string
  owner: string
  config?: GetTokenAccountsByOwnerConfig
}): Promise<{ tokenAccounts: TokenAccount[]; sdkTokenAccounts: SDK_TokenAccount[] }> {
  const connection = getConnection(endpointUrl)
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
    const sdkTokenAccounts: SDK_TokenAccount[] = []

    for (const { pubkey, account } of tokenResp.value) {
      // double check layout length
      if (account.data.length !== SPL_ACCOUNT_LAYOUT.span) {
        console.error('invalid token account layout length', 'publicKey', pubkey.toBase58())
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
      isNative: true,
    })

    // set cache
    tokenAccounts.forEach(
      (account) => account.publicKey && TokenAccountCache.set(account.publicKey, { owner, account }),
    )
    sdkTokenAccounts.forEach((account) => SDKTokenAccountCache.set(account.pubkey.toString(), { owner, account }))
    queriedOwner.set(owner, { tokenAccounts, sdkTokenAccounts })

    return { tokenAccounts, sdkTokenAccounts }
  }
}

