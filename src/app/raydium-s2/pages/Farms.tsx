import { Piv } from '@edsolater/piv'
import { createRef, useElementSize } from '@edsolater/pivkit'
import { createMemo, For, Show } from 'solid-js'
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
          gap: 4
        }}
      >
        <For each={farmStore.allFarmJsonInfos}>
          {(info) => (
            <>
              <details>
                <summary>
                  <Piv
                    icss={{
                      display: 'inline-grid',
                      gridTemplateColumns: isWidthSmall() ? '120px' : '150px 500px',
                      paddingBlock: 6,
                      ':nth-child(2n)': { background: '#8080802e' }
                    }}
                  >
                    <Piv>{info.symbol}</Piv>
                    <Piv>{info.baseMint}</Piv>
                    <Show when={!isWidthSmall()}>
                      {/* <Piv>{info.version}</Piv> */}
                    </Show>
                  </Piv>
                </summary>

                <Piv>{info.symbol} farm's detail here</Piv>
              </details>
            </>
          )}
        </For>
      </Piv>
    </Piv>
  )
}
