import { jFetch } from '../../../../../../packages/jFetch';
import { FarmPoolAprJsonInfo } from '../types/type';


async function fetchFarmAprJsonInfos(options: {
  apiUrl: string;
  owner?: string;
}): Promise<FarmPoolAprJsonInfo[] | undefined> {
  const result = await jFetch<{ data: FarmPoolAprJsonInfo[]; }>(options.apiUrl, { cacheFreshTime: 5 * 60 * 1000 });
  if (!result)
    return undefined;
  return result.data;
}
