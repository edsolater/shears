import { Piv } from '../../../packages/piv/Piv'
import { usePairStore } from '../stores/pairs/store'
import { useTokenStore } from '../stores/tokens/store'
import { useWalletAdapter } from '../stores/wallet/store'
import { FarmPanel } from './FarmsPanel'
import { PairsPanel } from './PairsPanel'

export function AppContentPage() {
  const { allPairJsonInfos, isPairsLoading } = usePairStore()
  const {} = useWalletAdapter()
  const { allTokens, isTokenLoading } = useTokenStore()

  return (
    <div>
      <Piv icss={{ fontSize: '2em' }}>AppContentPage</Piv>
      <Piv>token count: {isTokenLoading() ? '(loading)' : allTokens().length}</Piv>
      <Piv>pair count: {isPairsLoading() ? '(loading)' : allPairJsonInfos().length}</Piv>
      <PairsPanel />
      <FarmPanel />
    </div>
  )
}
