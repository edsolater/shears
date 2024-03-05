export interface RPCEndpoint {
  name?: string
  url: string
  weight?: number
  isUserCustomized?: true
  /** @default 'mainnet' */
  net?: "mainnet" | "devnet"
}
export const availableRpcs: RPCEndpoint[] = [
  {
    name: "inner test rpc",
    url: "https://rpc.asdf1234.win",
  },
  {
    name: "dev tool",
    url: "https://rpc.asdf1234.win",
  },
]
