import { createMemo } from 'solid-js'
import { Piv } from '../../../packages/piv'
import { Box, icssBlock_row } from '../../../packages/pivkit'
import { Input } from '../../../packages/pivkit/components/Input'
import { NavBar } from '../components/NavBar'
import { useSwapTokenAmount1, useSwapTokenAmount2, useSwapToken1 } from '../stores/data/atoms/swap'
import { useDataStore } from '../stores/data/store'
import { toString } from '../utils/dataStructures/basicMath/format'
import { isStringNumber } from '@edsolater/fnkit'

export function SwapPage() {
  const [swapToken1, setSwapToken1] = useSwapToken1() // here token is just mint
  const dataStore = useDataStore()
  const token = createMemo(() => dataStore.allTokens?.find((t) => t.mint === swapToken1()))
  const [amount1, setAmount1] = useSwapTokenAmount1()
  const tokenAmount1 = createMemo(() => toString(amount1()))
  const [amount2, setAmount2] = useSwapTokenAmount2()
  const tokenAmount2 = createMemo(() => toString(amount2()))
  return (
    <Piv>
      <NavBar title='Swap' />
      <Box icss={icssBlock_row({ gap: 8 })}>
        <Piv>SOL</Piv>
        <Input
          icss={{ border: 'solid', width: '12em', flex:0 }}
          // value={tokenAmount1}
          // onUserInput={({ text }) => setAmount1(isStringNumber(text) ? text : undefined)}
        />
      </Box>
      <Box icss={icssBlock_row({ gap: 8 })}>
        <Piv>RAY</Piv>
        <Input
          icss={{ border: 'solid', width: '12em', flex:0 }}
          value={tokenAmount2}
          onUserInput={({ text }) => setAmount2(isStringNumber(text) ? text : undefined)}
        />
      </Box>
    </Piv>
  )
}
