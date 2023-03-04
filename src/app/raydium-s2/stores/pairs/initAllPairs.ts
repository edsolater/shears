import { createOnFirstAccessCallback } from '@edsolater/pivkit';
import { reconcile } from 'solid-js/store';
import { queryPairJson } from './queryPairJson';
import { PairsStore } from './store';


export const initAllPairs = createOnFirstAccessCallback<PairsStore>(
  'allPairJsonInfos',
  async ({ setPairsState, setIsPairsLoading, setAllPairJsonInfos, setStore }) => {
    setIsPairsLoading(true);
    const allPairJsonInfos = await queryPairJson();
    setPairsState('loaded');
    setIsPairsLoading(false);
    allPairJsonInfos && setAllPairJsonInfos(allPairJsonInfos.slice(0, 8));
    let count = 0;
    const clonedAllPairJsonInfos = structuredClone(allPairJsonInfos);
    setInterval(() => {
      const newPairs = clonedAllPairJsonInfos?.slice(0, 8).map((i) => ({ ...i, name: i.name + count }));
      newPairs && setStore('allPairJsonInfos', reconcile(newPairs));
      count++;
    }, 1000);
  }
);
