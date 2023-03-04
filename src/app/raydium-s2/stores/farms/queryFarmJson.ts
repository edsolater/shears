import { appApiUrls } from '../common/utils/config';
import { queryWebWorker } from '../common/webworker/worker_receiver';
import { FarmPoolJsonInfo, FetchFarmsOptions } from './type';

export function queryFarmJson() {
  return queryWebWorker<FarmPoolJsonInfo[], FetchFarmsOptions>('fetch raydium farms info', { url: appApiUrls.farmInfo });
}
