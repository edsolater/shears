import { createOnFirstAccessCallback, createOnStoreInitCallback } from '@edsolater/pivkit';
import { autoConnectWallet } from './autoConnectWallet';
import { WalletStore } from './store';

/** store-utils */
export const initWalletAccess = createOnStoreInitCallback<WalletStore>(
  async ({ set$hasInited, setConnected, setOwner, setCurrentWallet }) => {
    autoConnectWallet({
      onLoadSuccess: ({ owner, adapterInterface }) => {
        set$hasInited(true);
        setConnected(true);
        setOwner(owner);
        setCurrentWallet(adapterInterface);
      },
      onBeforeInit: () => {
        set$hasInited(false);
      },
      onAfterInit: () => {
        set$hasInited(true);
      }
    });
  }
);
