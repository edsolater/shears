import { Piv, signalize } from '@edsolater/piv'
import { createRef, useElementSize } from '@edsolater/pivkit'
import { createMemo, For, Show } from 'solid-js'
import { NavBar } from '../components/NavBar'
import { usePairStore } from '../stores/pairs/store'

export function PairsPanel() {
  const pairStore = usePairStore()
  // -------- determine size  --------
  const [ref, setRef] = createRef<HTMLElement>()
  const { width, height } = useElementSize(ref)
  const isHeightSmall = createMemo(() => (height() ?? Infinity) < 500)
  const isWidthSmall = createMemo(() => (width() ?? Infinity) < 800)

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
        <Piv icss={{ fontSize: '2em' }}>Pools</Piv>
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
