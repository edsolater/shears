import { USDCMint, USDTMint, WSOLMint } from "../../../configs/wellKnownMints"
import { Token } from "../token/type"
import { RaydiumTokenListJsonFile, TokenWorkerData } from "../types/tokenList"

/**
 * used in webworker
 */
export async function fetchTokenJsonFile(options: { url: string }) {
  return forceTokenJsonFile()
  // const res = await jFetch<RaydiumTokenListJsonFile>(options.url, {
  //   cacheFreshTime: 5 * 60,
  // })

  // return res && handleRaydiumTokenJsonFile(res)
}

function forceTokenJsonFile() {
  const targetTokens: any[] = [
    {
      symbol: "USDC",
      name: "USD Coin",
      mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      decimals: 6,
      extensions: {},
      icon: "https://img-v1.raydium.io/icon/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v.png",
      hasFreeze: 1,
      is: "raydium-official",
    },
    {
      symbol: "USDT",
      name: "USDT",
      mint: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
      decimals: 6,
      extensions: {},
      icon: "https://img-v1.raydium.io/icon/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB.png",
      hasFreeze: 1,
      is: "raydium-official",
    },
    {
      symbol: "WSOL",
      name: "Wrapped SOL",
      mint: "So11111111111111111111111111111111111111112",
      decimals: 9,
      extensions: {},
      icon: "https://img-v1.raydium.io/icon/So11111111111111111111111111111111111111112.png",
      hasFreeze: 0,
      is: "raydium-official",
    },
  ]
  return {
    tokens: targetTokens,
    blacklist: [] as string[],
  }
}

function handleRaydiumTokenJsonFile(res: RaydiumTokenListJsonFile): TokenWorkerData {
  const targetTokenMints = new Set([USDCMint, USDTMint, WSOLMint])
  const tokens = [
    ...((res.official.filter((t) => targetTokenMints.has(t.mint)).map((t) => ({ ...t, is: "raydium-official" })) ??
      []) as Token[]),
    // !too much unofficial token(count: 65K), so just support official token(count: 247)
    // ...((res.unOfficial.map((t) => ({ ...t, is: "raydium-unofficial" })) ?? []) as Token[]),
  ]
  console.log("tokens.length: ", JSON.stringify(tokens, null, 2))
  return { tokens, blacklist: res.blacklist }
}
