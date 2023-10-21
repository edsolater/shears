import { assert } from '@edsolater/fnkit'
import { createMemo } from 'solid-js'
import { Button, Card, Piv, Section, icss_card, icss_col } from '../../packages/pivkit'
import { TokenAmountInputBox } from '../components/TokenAmountInput'
import { useToken } from '../stores/data/dataHooks/useToken'
import { useSwapAmountCalculator as useSwapAmountCalculatorEffect } from '../stores/data/featureHooks/useSwapAmountCalculator'
import { txSwap_main } from '../stores/data/portActions/txSwap_main'
import { createStorePropertySetter, createStorePropertySignal, setStore, store } from '../stores/data/store'
import { useWalletOwner } from '../stores/wallet/store'
import { Token } from '../utils/dataStructures/Token'
import { notZero } from '../utils/dataStructures/basicMath/compare'
import { toString } from '../utils/dataStructures/basicMath/format'

export default function SwapPage() {
  const owner = useWalletOwner()
  const token1 = useToken(() => store.swapInputToken1) // it still can work, but why?
  const token2 = useToken(() => store.swapInputToken2) // it still can work, but why?
  const setToken1 = (token: Token | undefined) => {
    token && setStore({ swapInputToken1: token })
  }
  const setToken2 = (token: Token | undefined) => {
    token && setStore({ swapInputToken2: token })
  }

  const amount1 = createStorePropertySignal((s) => s.swapInputTokenAmount1)
  const amount2 = createStorePropertySignal((s) => s.swapInputTokenAmount2)
  const setAmount1 = createStorePropertySetter((s) => s.swapInputTokenAmount1)
  const setAmount2 = createStorePropertySetter((s) => s.swapInputTokenAmount2)
  const tokenAmount1 = createMemo(() =>
    amount1() ? toString(amount1(), { decimalLength: token1.decimals }) : undefined,
  )
  const tokenAmount2 = createMemo(() =>
    amount2() ? toString(amount2(), { decimalLength: token2.decimals }) : undefined,
  )

  useSwapAmountCalculatorEffect()

  return (
    <Piv>
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

          <Button
            onClick={() => {
              console.info('start swap')
              const coin1 = token1
              assert(coin1, 'coin1 is undefined')
              const coin2 = token2
              assert(coin2, 'coin2 is undefined')
              const amount1 = tokenAmount1()
              assert(notZero(amount1), 'amount1 is undefined or zero')
              const walletOwner = owner()
              assert(walletOwner, 'walletOwner is undefined')

              txSwap_main({
                owner: walletOwner,
                checkInfo: {
                  rpcUrl: 'https://rpc.asdf1234.win',
                  coin1,
                  coin2,
                  amount1,
                  direction: '1 → 2',
                },
              })
            }}
          >
            Swap
          </Button>
        </Card>
      </Section>
    </Piv>
  )
}
