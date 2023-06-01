import { createEffect } from 'solid-js'
import { Piv } from '../../../packages/piv'
import { Button, icss_card, icss_col, icss_row } from '../../../packages/pivkit'
import { Card } from '../../../packages/pivkit/components/Card'
import { Section } from '../../../packages/pivkit/components/Section'
import { NavBar } from '../components/NavBar'
import { TokenAmountInputBox } from '../components/TokenAmountInput'
import {
  useSwapAmountCalculator,
  useSwapToken1,
  useSwapToken2,
  useSwapTokenAmount1,
  useSwapTokenAmount2,
} from '../stores/data/atoms/swap'
import { useDataStore } from '../stores/data/store'
import { toString } from '../utils/dataStructures/basicMath/format'
import { Token } from '../utils/dataStructures/Token'
import { txSwap_main } from '../stores/data/utils/txSwap_main'

export function SwapPage() {
  const [swapToken1, setSwapToken1] = useSwapToken1() // here token is just mint
  const dataStore = useDataStore()
  const [token1Mint, setToken1Mint] = useSwapToken1()
  const [token2Mint, setToken2Mint] = useSwapToken2()
  const token1 = () => dataStore.allTokens?.find((t) => t.mint === token1Mint())
  const token2 = () => dataStore.allTokens?.find((t) => t.mint === token2Mint())
  const setToken1 = (token: Token | undefined) => {
    token?.mint && setToken1Mint(token?.mint)
  }
  const setToken2 = (token: Token | undefined) => {
    token?.mint && setToken1Mint(token?.mint)
  }

  const [amount1, setAmount1] = useSwapTokenAmount1()
  const [amount2, setAmount2] = useSwapTokenAmount2()
  const tokenAmount1 = () => (amount1() ? toString(amount1(), { decimalLength: token1()?.decimals }) : undefined)
  const tokenAmount2 = () => (amount2() ? toString(amount2(), { decimalLength: token2()?.decimals }) : undefined)

  useSwapAmountCalculator()

  createEffect(() => {
    console.log('tokenAmount1(): ', tokenAmount1())
    console.log('amount1(): ', amount1())
  })
  createEffect(() => {
    console.log('tokenAmount2(): ', tokenAmount2())
    console.log('amount2(): ', amount2())
  })

  return (
    <Piv>
      <NavBar title='Swap' />
      <Section icss={{ display: 'grid', justifyContent: 'center' }}>
        <Card icss={[icss_card, icss_col({ gap: '.5em' })]}>
          <TokenAmountInputBox
            token={token1}
            amount={tokenAmount1}
            onSelectToken={setToken1}
            onAmountChange={setAmount1}
          />
          <TokenAmountInputBox
            token={token2}
            amount={tokenAmount2}
            onSelectToken={setToken2}
            onAmountChange={setAmount2}
          />

          <Button onClick={()=>{txSwap_main({})}}>Swap</Button>
        </Card>
      </Section>
    </Piv>
  )
}
