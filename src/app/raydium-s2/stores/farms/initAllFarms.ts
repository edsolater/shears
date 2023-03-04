import { createOnFirstAccessCallback } from '@edsolater/pivkit';
import { queryFarmJson } from './queryFarmJson';
import { FarmsStore } from './store';


export const initAllFarms = createOnFirstAccessCallback<FarmsStore>(
  'allFarmJsonInfos',
  async ({ setFarmsState, setIsFarmsLoading, setAllFarmJsonInfos }) => {
    setIsFarmsLoading(true);
    const allFarmJsonInfos = await queryFarmJson();
    setFarmsState('loaded');
    setIsFarmsLoading(false);
    allFarmJsonInfos && setAllFarmJsonInfos(allFarmJsonInfos.slice(0, 8));
  }
);
