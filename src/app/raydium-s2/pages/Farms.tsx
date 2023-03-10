import { Piv } from '../../../packages/piv'
import { createMemo, For, Show } from 'solid-js'
import { Collapse, createRef, useElementSize } from '../../../packages/pivkit'
import { tailwindPaletteColors } from '../../../packages/pivkit/styles/tailwindPaletteColors'
import { NavBar } from '../components/NavBar'
import { useFarmStore } from '../stores/farms/store'

export function FarmPanel() {
  const farmStore = useFarmStore()
  // -------- determine size  --------
  const [ref, setRef] = createRef<HTMLElement>()
  const { width, height } = useElementSize(ref)
  const isHeightSmall = createMemo(() => (height() ?? Infinity) < 500)
  const isWidthSmall = createMemo(() => (width() ?? Infinity) < 800)

  // createEffect(() => console.log('isFarmJsonsLoading', isFarmJsonsLoading()))
  return (
    <Piv>
      <NavBar barTitle='Farms' />
      <Piv
        ref={setRef}
        icss={{
          borderRadius: 4,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          '> :nth-child(2n)': { background: tailwindPaletteColors.gray50 }
        }}
      >
        <For each={farmStore.allFarmJsonInfos}>
          {(info) => (
            <Collapse>
              <Collapse.Face>
                {(status) => (
                  <Piv
                    icss={{
                      display: 'inline-grid',
                      gridTemplateColumns: isWidthSmall() ? '120px' : 'auto 150px 500px',
                      gap: 32,
                      paddingBlock: 6,
                      ':nth-child(2n)': { background: '#8080802e' }
                    }}
                  >
                    <Piv>{status.isOpen ? 'open':'closed'}</Piv>
                    <Piv>{info.symbol}</Piv>
                    <Piv>{info.baseMint}</Piv>
                    <Show when={!isWidthSmall()}>{/* <Piv>{info.version}</Piv> */}</Show>
                  </Piv>
                )}
              </Collapse.Face>
              <Collapse.Content>
                <Piv>{info.symbol} farm's detail here</Piv>
              </Collapse.Content>
            </Collapse>
          )}
        </For>
      </Piv>
    </Piv>
  )
}
