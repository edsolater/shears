import { registMessageReceiver } from '../../../utils/webworker/loadWorker_worker';
import { FetchRaydiumTokenPriceOptions } from '../types/tokenPrice';
import { fetchTokenPrices } from '../utils/fetchTokenPrices';
import { MessagePortTransformers } from '../../../utils/webworker/createMessagePortTransforers';

export function loadTokenPrice_worker(transformers: MessagePortTransformers) {
  registMessageReceiver<FetchRaydiumTokenPriceOptions>(
    'get raydium token prices',
    async ({ payload: options, resolve }) => fetchTokenPrices(options.tokens, options.url).then((res) => resolve({ prices: res }))
  );
}
