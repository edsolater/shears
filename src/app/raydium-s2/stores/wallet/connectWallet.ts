import { WalletAdapterInterface } from './type';

/** util function */
export function connectWallet(wallet: WalletAdapterInterface): Promise<WalletAdapterInterface> {
  return wallet.adapter.connect().then(() => wallet);
}
