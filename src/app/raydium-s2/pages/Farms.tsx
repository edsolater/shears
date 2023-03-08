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
      <NavBar />

      <Piv
        ref={setRef}
        icss={{
          boxShadow: 'inset 0 0 0px 2px dodgerblue',
          borderRadius: 4,
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          width: 'fit-content',
          resize: 'both',
          overflow: 'hidden'
        }}
      >
        <Piv icss={{ fontSize: '2em' }}>Farms</Piv>
        <For each={farmStore.allFarmJsonInfos}>
          {(info) => (
            <Piv
              icss={{
                display: 'grid',
                gridTemplateColumns: isWidthSmall() ? '120px' : '150px 500px',
                paddingBlock: 4,
                ':nth-child(2n)': { background: '#8080802e' }
              }}
            >
              <Piv>{info.symbol}</Piv>
              <Show when={!isWidthSmall()}>
                <Piv>{info.version}</Piv>
              </Show>
            </Piv>
          )}
        </For>
      </Piv>
    </Piv>
  )
}
