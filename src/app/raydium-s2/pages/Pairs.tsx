import { Piv, signalize } from '@edsolater/piv'
import { createRef, useElementSize } from '@edsolater/pivkit'
import { createMemo, For, Show } from 'solid-js'
import { NavBar } from '../components/NavBar'
import { usePairStore } from '../stores/pairs/store'

const icssSmoothBoxShadow =
  '0 1px 1px rgb(16 27 30 / 15%), 0 2px 2px rgb(16 27 30 / 15%), 0 4px 4px rgb(16 27 30 / 15%), 0 8px 8px rgb(16 27 30 / 15%), 0 16px 16px rgb(16 27 30 / 15%)'
  
export function PairsPanel() {
  const pairStore = usePairStore()
  // -------- determine size  --------
  const [ref, setRef] = createRef<HTMLElement>()
  const { width, height } = useElementSize(ref)
  const isHeightSmall = createMemo(() => (height() ?? Infinity) < 500)
  const isWidthSmall = createMemo(() => (width() ?? Infinity) < 800)

  return (
    <Piv>
      <NavBar  barTitle='Pools' />
      <Piv
        ref={setRef}
        icss={{
          // boxShadow: icssSmoothBoxShadow,
          borderRadius: 4,
          display: 'flex',
          flexDirection: 'column',
          gap: 4
        }}
      >
        <For each={pairStore.allPairJsonInfos}>
          {(info) => (
            <Piv
              icss={{
                display: 'grid',
                gridTemplateColumns: isWidthSmall() ? '120px' : '150px 500px',
                paddingBlock: 4,
                ':nth-child(2n)': { background: '#8080802e' }
              }}
            >
              <Piv>{info.name}</Piv>
              <Show when={!isWidthSmall()}>
                <Piv>{info.ammId}</Piv>
              </Show>
            </Piv>
          )}
        </For>
      </Piv>
    </Piv>
  )
}
