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

export function SwapPage() {
  const [swapToken1, setSwapToken1] = useSwapToken1() // here token is just mint
  const dataStore = useDataStore()
  // const token = createMemo(() => dataStore.allTokens?.find((t) => t.mint === swapToken1()))
  const [token1Mint, setToken1Mint] = useSwapToken1()
  const token1 = createMemo(() => dataStore.allTokens?.find((t) => t.mint === token1Mint()))
  const [token2Mint, setToken2Mint] = useSwapToken2()
  const token2 = createMemo(() => dataStore.allTokens?.find((t) => t.mint === token2Mint()))

  const [amount1, setAmount1] = useSwapTokenAmount1()
  const tokenAmount1 = createDerivedAccessor(amount1, (amount) => (amount ? String(amount) : undefined))
  const [amount2, setAmount2] = useSwapTokenAmount2()
  const tokenAmount2 = createDerivedAccessor(amount2, (amount) => (amount ? String(amount) : undefined))

  useSwapAmountCalculator()
  // createEffect(() => console.log('tokenAmount1: ', tokenAmount1()))
  return (
    <Piv>
      <NavBar title='Swap' />
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
    </Piv>
  )
}

function createDerivedAccessor<T, U>(signal: () => T, mapFn: (v: T) => U): () => U {
  return createMemo(() => mapFn(signal()))
}
