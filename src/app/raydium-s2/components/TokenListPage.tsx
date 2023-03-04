import { Piv } from '../../../packages/piv/Piv'
import { useDataStore } from '../stores'
import { useWalletAdapter } from '../stores/wallet/store'
import { FarmPanel } from './FarmsPanel'
import { PairsPanel } from './PairsPanel'

export function AppContentPage() {
  const { allTokens, isTokenLoading, allPairJsonInfos, isPairsLoading } = useDataStore()
  const {} = useWalletAdapter()

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
