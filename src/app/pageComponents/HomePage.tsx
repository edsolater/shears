import { Box, Piv } from '../../packages/pivkit'
import { Link } from '../components/Link'
import { store } from '../stores/data/store'
import { useWalletStore } from '../stores/wallet/store'
import { count } from '../utils/dataTransmit/itemMethods'

export default function HomePage() {
  const walletStore = useWalletStore()
  return (
    <div>
      <Box icss={{ margin: '8px' }}>
        {/* info */}
        <Piv>token count: {store.isTokenListLoading ? '(loading)' : count(store.tokens)}</Piv>
        <Piv>current owner: {walletStore.owner}</Piv>
        <Piv>pair count: {store.isPairInfoLoading ? '(loading)' : count(store.pairInfos)}</Piv>
      </Box>
      <Link href={'/swap'}innerRoute>Swap</Link>

      {/* <LinkItem icon='/icons/entry-icon-pools.svg' href='/pools' isCurrentRoutePath={pageMatcher.isPairsPage}>
        Pools
      </LinkItem>
      <LinkItem icon='/icons/entry-icon-farms.svg' href='/farms' isCurrentRoutePath={pageMatcher.isFarmsPage}>
        Farms
      </LinkItem> */}
    </div>
  )
}
