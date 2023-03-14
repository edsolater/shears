import { createEffect, createMemo, For, Show } from 'solid-js'
import { Piv } from '../../../../packages/piv'
import { Box, Button, Collapse, createRef, useElementSize } from '../../../../packages/pivkit'
import { tailwindPaletteColors } from '../../../../packages/pivkit/styles/tailwindPaletteColors'
import { CoinAvatarPair } from '../../components/CoinAvatarPair'
import { NavBar } from '../../components/NavBar'
import { useFarmStore } from '../../stores/farms/store'
import { useTokenListStore } from '../../stores/tokenList/store'
import { useTokenPriceStore } from '../../stores/tokenPrice/store'
import { useFarmPageStates } from './farmState'

const icssSmoothBoxShadow =
  '0 1px 1px rgb(16 27 30 / 8%), 0 2px 2px rgb(16 27 30 / 8%), 0 4px 4px rgb(16 27 30 / 8%), 0 8px 8px rgb(16 27 30 / 8%), 0 16px 16px rgb(16 27 30 / 8%)'

export function FarmPage() {
  const farmStore = useFarmStore()
  const farmPageStates = useFarmPageStates()
  const tokenPriceStore = useTokenPriceStore()

  // createEffect(() => console.log('isFarmJsonsLoading', isFarmJsonsLoading()))
  createEffect(() => console.log('rokenPriceStore prices', tokenPriceStore.prices))
  createEffect(() => console.log('farmStore sdk', farmStore.farmSdkInfoInfos))
  return (
    <Piv>
      <NavBar barTitle='Farms' />

      {/* TODO: should experiment how to move smoothly */}
      {farmPageStates.detailViewFarmId ? (
        <div>
          <Button
            onClick={() => {
              farmPageStates.setDetailViewFarmId(undefined)
            }}
            icss={{ marginBottom: '24px' }}
          >
            back to list
          </Button>
          <FarmDetailPanel />
        </div>
      ) : (
        <FarmItems />
      )}
    </Piv>
  )
}

function FarmItems() {
  const farmStore = useFarmStore()
  const farmPageStates = useFarmPageStates()
  const tokenPriceStore = useTokenPriceStore()
  const tokenListStore = useTokenListStore()
  // -------- determine size  --------
  const [ref, setRef] = createRef<HTMLElement>()
  const { width, height } = useElementSize(ref)
  const isHeightSmall = createMemo(() => (height() ?? Infinity) < 500)
  const isWidthSmall = createMemo(() => (width() ?? Infinity) < 800)

  return (
    <Piv
      ref={setRef}
      icss={{
        '--item-width': '300px',
        display: 'grid',
        paddingInline: 16,
        gridTemplateColumns: 'repeat(auto-fit, minmax(var(--item-width), 1fr))',
        gap: 16,
        '> :nth-child(2n)': {
          background: tailwindPaletteColors.gray50
        }
      }}
    >
      <For each={farmStore.farmJsonInfos}>
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
                  onClick={() => {
                    farmPageStates.setDetailViewFarmId(info.id)
                  }}
                >
                  <Box
                    icss={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8
                    }}
                  >
                    <CoinAvatarPair
                      token1={tokenListStore.getToken(info.baseMint)}
                      token2={tokenListStore.getToken(info.quoteMint)}
                    />
                    <Piv>{info.symbol}</Piv>
                  </Box>
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
  )
}

function FarmDetailPanel() {
  const farmStore = useFarmStore()
  const farmPageStates = useFarmPageStates()
  const tokenPriceStore = useTokenPriceStore()
  const tokenListStore = useTokenListStore()
  // -------- determine size  --------
  const [ref, setRef] = createRef<HTMLElement>()
  const { width, height } = useElementSize(ref)
  const isHeightSmall = createMemo(() => (height() ?? Infinity) < 500)
  const isWidthSmall = createMemo(() => (width() ?? Infinity) < 800)

  return (
    <Piv
      ref={setRef}
      icss={{
        background: tailwindPaletteColors.gray50
      }}
    >
      show details (farm id: {farmPageStates.detailViewFarmId})
    </Piv>
  )
}
