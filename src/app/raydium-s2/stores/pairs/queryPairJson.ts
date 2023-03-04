import { appApiUrls } from '../common/utils/config';
import { queryWebWorker } from '../common/webworker/worker_receiver';
import { FetchPairsOptions, JsonPairItemInfo } from './type';

export function queryPairJson() {
  return queryWebWorker<JsonPairItemInfo[], FetchPairsOptions>('fetch raydium pairs info', {
    url: appApiUrls.pairs,
    force: false
  });
}
