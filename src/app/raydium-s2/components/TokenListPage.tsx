import { Piv } from '../../../packages/piv/Piv'
import { Box } from '../../../packages/pivkit/components/Box'
import { usePairStore } from '../stores/pairs/store'
import { useTokenStore } from '../stores/tokens/store'
import { useWalletStore } from '../stores/wallet/store'
import { FarmPanel } from './FarmsPanel'
import { PairsPanel } from './PairsPanel'

export function AppContentPage() {
  const { allPairJsonInfos, isPairsLoading } = usePairStore()
  const { owner } = useWalletStore()
  const { allTokens, isTokenLoading } = useTokenStore()

  return (
    <div>
      <Box icss={{ display: 'grid', marginBlock: 24, placeContent: 'center' }}>
        <Piv icss={{ fontSize: '2em' }}>Raydium-S2</Piv>
      </Box>
      <Box icss={{ margin: 8 }}>
        {/* info */}
        <Piv>token count: {isTokenLoading() ? '(loading)' : allTokens().length}</Piv>
        <Piv>current owner: {owner?.()}</Piv>
        <Piv>pair count: {isPairsLoading() ? '(loading)' : allPairJsonInfos().length}</Piv>
      </Box>
      <PairsPanel />
      <FarmPanel />
    </div>
  )
}
