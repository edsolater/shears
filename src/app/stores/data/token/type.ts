import type { Mint } from '../../../utils/dataStructures/type';
import type { Accessify } from '@edsolater/pivkit';


export interface TokenBase {
  mint: string; // SOL's mint is PublicKey.default.toString() // WSOL(symbol is SOL) is 'So11111111111111111111111111111111111111112'
  decimals: number;
  programId: string;

  symbol?: string; // WSOL has wrapped to SOL, SOL is SOL
  name?: string;
}
/** minium data shape that can be hydrated to a SPLToken */

export interface Token extends TokenBase {
  // --------- needed 🤔 computed data 😂? ----------
  extensions?: {
    coingeckoId?: string;
    version?: 'TOKEN2022';
  };
  realSymbol?: string; // WSOL is WSOL, SOL is SOL. For normal tokens, this property is the same as symbol
  is?: 'default-empty-token' // fake status token
  |
  'loading-token' // fake status token
  |
  'error-token' // fake status token
  |
  'sol' // fake token
  |
  'raydium-official' |
  'raydium-unofficial' |
  'raydium-unnamed' |
  'raydium-blacklist'; // online-info
  userAdded?: boolean; // only if token is added by user // online-info
  icon?: string;
  hasFreeze?: boolean; // online-info
}

export type Tokens = Map<Mint, Token>;

export type TokenQueryParam = Accessify<Mint> | Accessify<Token> | Accessify<Mint | Token>;
