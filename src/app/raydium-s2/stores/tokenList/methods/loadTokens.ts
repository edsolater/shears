import { useTokenListStore, getTokenJsonInfo } from '../store';

export function loadTokens() {
  useTokenListStore().$setters.setIsLoading(true);
  getTokenJsonInfo((allTokens) => {
    useTokenListStore().$setters.setIsLoading(false);
    allTokens?.tokens && useTokenListStore().$setters.setAllTokens(allTokens.tokens);
  });
}
