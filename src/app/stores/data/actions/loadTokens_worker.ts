import { registMessageReceiver } from '../../../utils/webworker/loadWorker_worker';
import { FetchRaydiumTokenListOptions } from '../types/tokenList';
import { fetchTokenJsonFile } from '../utils/fetchTokenJson';
import { SOLToken } from '../../../utils/dataStructures/Token';
import { MessagePortTransformers } from '../../../utils/webworker/createMessagePortTransforers';

export function loadTokens_worker(transformers: MessagePortTransformers) {
  registMessageReceiver<FetchRaydiumTokenListOptions>(
    'fetch raydium supported tokens',
    async ({ payload: options, resolve }) =>
      /* TODO: currently only mainnet raydium token list was supported*/
      fetchTokenJsonFile(options).then((res) => {
        const availableTokens = res?.tokens
          .filter((t) => !res?.blacklist.includes(t.mint) || t.name === 'Native Solana')
          .concat(SOLToken); // replace api mistakely add SOL
        availableTokens && resolve(availableTokens);
      })
  );
}
