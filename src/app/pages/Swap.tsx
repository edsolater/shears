import { assert } from '@edsolater/fnkit'
import { Accessor, createEffect, createMemo } from 'solid-js'
import { Button, Card, Piv, Section, icss_card, icss_col, useAtom } from '../../packages/pivkit'
import { NavBar } from '../components/NavBar'
import { TokenAmountInputBox } from '../components/TokenAmountInput'
import {
  swapToken1,
  swapToken2,
  swapTokenAmount1,
  swapTokenAmount2,
} from '../stores/data/atoms/swap'
import { useSwapAmountCalculator as useSwapAmountCalculatorEffect } from '../stores/data/featureHooks/useSwapAmountCalculator'
import { useDataStore } from '../stores/data/store'
import { txSwap_main } from '../stores/data/utils/txSwap_main'
import { useWalletOwner } from '../stores/wallet/store'
import { Token } from '../utils/dataStructures/Token'
import { notZero } from '../utils/dataStructures/basicMath/compare'
import { toString } from '../utils/dataStructures/basicMath/format'
/**
 * transform mint to token
 * @param mint token mint
 * @returns
 */
function useTokenByMint(mint: Accessor<string | undefined>) {
  const dataStore = useDataStore()
  const token = createMemo(() => dataStore.allTokens?.find((t) => t.mint === mint()))
  return token
}

export default function SwapPage() {
  const owner = useWalletOwner()
  const { get: token1Mint, set: setToken1Mint } = useAtom(swapToken1)
  const { get: token2Mint, set: setToken2Mint } = useAtom(swapToken2)
  const token1 = useTokenByMint(token1Mint)
  const token2 = useTokenByMint(token2Mint)
  const setToken1 = (token: Token | undefined) => {
    setToken1Mint(token?.mint)
  }
  const setToken2 = (token: Token | undefined) => {
    setToken2Mint(token?.mint)
  }

  const { get: amount1, set: setAmount1 } = useAtom(swapTokenAmount1)
  const { get: amount2, set: setAmount2 } = useAtom(swapTokenAmount2)
  const tokenAmount1 = () => (amount1() ? toString(amount1(), { decimalLength: token1()?.decimals }) : undefined)
  const tokenAmount2 = () => (amount2() ? toString(amount2(), { decimalLength: token2()?.decimals }) : undefined)

  useSwapAmountCalculatorEffect()

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

          <Button
            onClick={() => {
              console.info('start swap')
              const coin1 = token1()
              assert(coin1, 'coin1 is undefined')
              const coin2 = token2()
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
