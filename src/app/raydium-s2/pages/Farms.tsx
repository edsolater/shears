import { createEffect, createMemo, For, Show } from 'solid-js'
import { Piv } from '../../../packages/piv'
import { Collapse, createRef, useElementSize } from '../../../packages/pivkit'
import { tailwindPaletteColors } from '../../../packages/pivkit/styles/tailwindPaletteColors'
import { CoinAvatar } from '../components/CoinAvatar'
import { NavBar } from '../components/NavBar'
import { useFarmJsonAtom } from '../atoms/farmJson/atom'
import { useTokenPriceAtom } from '../atoms/tokenPrice/atom'

const icssSmoothBoxShadow =
  '0 1px 1px rgb(16 27 30 / 8%), 0 2px 2px rgb(16 27 30 / 8%), 0 4px 4px rgb(16 27 30 / 8%), 0 8px 8px rgb(16 27 30 / 8%), 0 16px 16px rgb(16 27 30 / 8%)'

export function FarmPanel() {
  const farmJsonAtom = useFarmJsonAtom()
  const tokenPriceAtom = useTokenPriceAtom()
  // -------- determine size  --------
  const [ref, setRef] = createRef<HTMLElement>()
  const { width, height } = useElementSize(ref)
  const isHeightSmall = createMemo(() => (height() ?? Infinity) < 500)
  const isWidthSmall = createMemo(() => (width() ?? Infinity) < 800)

  // createEffect(() => console.log('isFarmJsonsLoading', isFarmJsonsLoading()))
  createEffect(()=>console.log('pricesdd', tokenPriceAtom.prices.size))
  return (
    <Piv>
      <NavBar barTitle='Farms' />
      <Piv
        ref={setRef}
        icss={{
          display: 'grid',
          paddingInline: 32,
          gridTemplateColumns: 'repeat(2, minmax(300px, 1fr))',
          gap: 16,
          '> :nth-child(2n)': { background: tailwindPaletteColors.gray50 }
        }}
      >
        <For each={farmJsonAtom.infos}>
          {(info) => (
            <Collapse onlyContent>
              <Collapse.Content>
                {(status) => (
                  <Piv
                    icss={{
                      padding: 6,
                      borderRadius: 4,
                      boxShadow: icssSmoothBoxShadow
                    }}
                  >
                    <CoinAvatar tokenMint={info.baseMint} />
                    <CoinAvatar tokenMint={info.quoteMint} />
                    <Piv>{info.symbol}</Piv>
                    <Piv>{info.category}</Piv>
                    <Show when={status.isOpen}>
                      <Piv>{info.version}</Piv>
                    </Show>
                  </Piv>
                )}
              </Collapse.Content>
              {/* <Collapse.Content>
                <Piv>{info.symbol} farm's detail here</Piv>
              </Collapse.Content> */}
            </Collapse>
          )}
        </For>
      </Piv>
    </Piv>
  )
}


