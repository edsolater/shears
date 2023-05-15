import { isStringNumber } from '@edsolater/fnkit'
import { createEffect, createMemo } from 'solid-js'
import { Piv } from '../../../packages/piv'
import { Box, icssBlock_card, icssBlock_row } from '../../../packages/pivkit'
import { Input } from '../../../packages/pivkit/components/Input'
import { NavBar } from '../components/NavBar'
import {
  useSwapAmountCalculator,
  useSwapToken1,
  useSwapTokenAmount1,
  useSwapTokenAmount2
} from '../stores/data/atoms/swap'
import { useDataStore } from '../stores/data/store'
import { useSwapToken2 } from '../stores/data/atoms/swap'
import { toString } from '../utils/dataStructures/basicMath/format'
import { Section } from '../../../packages/pivkit/components/Section'
import { Card } from '../../../packages/pivkit/components/Card'
import { TokenAmountInputBox } from '../components/TokenAmountInput'

export function SwapPage() {
  const [swapToken1, setSwapToken1] = useSwapToken1() // here token is just mint
  const dataStore = useDataStore()
  const [token1Mint, setToken1Mint] = useSwapToken1()
  const [token2Mint, setToken2Mint] = useSwapToken2()
  const token1 = () => dataStore.allTokens?.find((t) => t.mint === token1Mint())
  const token2 = () => dataStore.allTokens?.find((t) => t.mint === token2Mint())
  const [amount1, setAmount1] = useSwapTokenAmount1()
  const [amount2, setAmount2] = useSwapTokenAmount2()
  const tokenAmount1 = () => (amount1() ? toString(amount1(), { decimalLength: token1()?.decimals }) : undefined)
  const tokenAmount2 = () => (amount2() ? toString(amount2(), { decimalLength: token2()?.decimals }) : undefined)

  useSwapAmountCalculator()
  return (
    <Piv>
      <NavBar title='Swap' />
      <Section icss={{ display: 'grid', justifyContent: 'center' }}>
        <Card icss={icssBlock_card}>
          <TokenAmountInputBox token={token1} amount={tokenAmount1} />
          <TokenAmountInputBox token={token2} amount={tokenAmount2} />
        </Card>
      </Section>
    </Piv>
  )
}
