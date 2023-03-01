import { Piv } from '../../../packages/piv/Piv'
import { useDataStore } from '../modules/stores'
import { useWalletAdapter } from '../modules/stores/wallet/store'
import { FarmPanel } from './FarmsPanel'
import { PairsPanel } from './PairsPanel'

export function AppContentPage() {
  const { allTokens, isTokenLoading, allAPIPairs, isPairsLoading, allFarmJsonInfos } = useDataStore()
  const {} = useWalletAdapter()

  return (
    <div>
      <Piv icss={{ fontSize: '2em' }}>AppContentPage</Piv>
      <Piv>token count: {isTokenLoading() ? '(loading)' : allTokens().length}</Piv>
      <Piv>pair count: {isPairsLoading() ? '(loading)' : allAPIPairs().length}</Piv>
      <PairsPanel infos={allAPIPairs()} />
      <FarmPanel infos={allFarmJsonInfos()} />
    </div>
  )
}
