import { createMemo } from 'solid-js'
import { Piv } from '../../../packages/piv'
import { NavBar } from '../components/NavBar'
import { useDataStore } from '../stores/data/store'
import { useSwapToken1 } from '../stores/swap/atoms'

export function SwapPage() {
  const [swapToken1, setSwapToken1] = useSwapToken1() // here token is just mint
  const dataStore = useDataStore()
  const token = createMemo(() => dataStore.allTokens?.find((t) => t.mint === swapToken1()))
  return (
    <Piv>
      <NavBar title='Swap' />
      mock V2's swap, but use webworker to calc smoother
      <Piv>{token()?.name}</Piv>
    </Piv>
  )
}
