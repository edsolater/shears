import { appApiUrls } from '../common/utils/config';
import { queryWebWorker } from '../common/webworker/worker_receiver';
import { FetchRaydiumTokenOptions, TokenMessageData } from './type';


export function queryTokenJsonInfo() {
  return queryWebWorker<TokenMessageData, FetchRaydiumTokenOptions>('fetch raydium supported tokens', {
    url: appApiUrls.tokenInfo
  });
}
