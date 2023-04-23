import { Piv } from '../../../packages/piv'
import { NavBar } from '../components/NavBar'
import { useSwapToken1 } from '../stores/swap/swapToken1'

export function SwapPage() {
  const [swapToken1, setSwapToken1] = useSwapToken1()
  return (
    <Piv>
      <NavBar title='Swap' />
      mock V2's swap, but use webworker to calc smoother
      <Piv>{swapToken1()?.name}</Piv>
    </Piv>
  )
}
