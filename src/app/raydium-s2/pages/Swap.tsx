import { isStringNumber } from '@edsolater/fnkit'
import { createEffect, createMemo } from 'solid-js'
import { Piv } from '../../../packages/piv'
import { Box, icssBlock_row } from '../../../packages/pivkit'
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
        <Card icss={{ display: 'grid', gap: 8, border: 'solid', padding: 16 }}>
          <Box icss={icssBlock_row({ gap: 8 })}>
            <Piv>{token1()?.symbol}</Piv>
            <Input
              icss={{ border: 'solid', width: '12em', flex: 0 }}
              value={tokenAmount1}
              onUserInput={({ text }) => {
                isStringNumber(text) ? setAmount1(text) : undefined
              }}
            />
          </Box>
          <Box icss={icssBlock_row({ gap: 8 })}>
            <Piv>{token2()?.symbol}</Piv>
            <Input
              icss={{ border: 'solid', width: '12em', flex: 0 }}
              value={tokenAmount2}
              onUserInput={({ text }) => {
                isStringNumber(text) ? setAmount2(text) : undefined
              }}
            />
          </Box>
        </Card>
      </Section>
    </Piv>
  )
}
