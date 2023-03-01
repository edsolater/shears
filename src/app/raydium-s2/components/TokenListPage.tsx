import { Piv } from '../../../packages/piv/Piv'
import { useWalletAdapter } from '../modules/stores/store-wallet'
import { useDataStore } from '../modules/stores/store'
import { PairsPanel } from './Pairs/Panel'
import { JSX } from 'solid-js/jsx-runtime'

export function AppContentPage() {
  const { allTokens, isTokenLoading, allAPIPairs, isPairsLoading } = useDataStore()
  const {} = useWalletAdapter()

  return (
    <div>
      <Piv icss={{ fontSize: '2em' }}>AppContentPage</Piv>
      <Piv>token count: {isTokenLoading() ? '(loading)' : allTokens().length}</Piv>
      <Piv>pair count: {isPairsLoading() ? '(loading)' : allAPIPairs().length}</Piv>
      <PairsPanel infos={allAPIPairs()} />
    </div>
  )
}

function Container(props: { children?: (utils: { width: number; height: number }) => JSX.Element }) {
  return <Piv>{props.children?.({ width: 3, height: 4 })}</Piv>
}
