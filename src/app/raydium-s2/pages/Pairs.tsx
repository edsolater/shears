import { createMemo, For } from 'solid-js'
import { Piv } from '../../../packages/piv'
import { Collapse, createRef, useElementSize } from '../../../packages/pivkit'
import { NavBar } from '../components/NavBar'
import { usePairStore } from '../stores/pairs/store'

export function PairsPanel() {
  const pairsStore = usePairStore()
  // -------- determine size  --------
  const [ref, setRef] = createRef<HTMLElement>()
  const { width, height } = useElementSize(ref)
  const isHeightSmall = createMemo(() => (height() ?? Infinity) < 500)
  const isWidthSmall = createMemo(() => (width() ?? Infinity) < 800)

  return (
    <Piv>
      <NavBar barTitle='Pools' />
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
        <For each={pairsStore.infos}>
          {(info) => (
            <Collapse>
              <Collapse.Face>
                <Piv
                  icss={{
                    display: 'grid',
                    gridTemplateColumns: isWidthSmall() ? '120px' : '150px 500px',
                    paddingBlock: 4,
                    ':nth-child(2n)': { background: '#8080802e' }
                  }}
                >
                  <Piv>{info.name}</Piv>
                </Piv>
              </Collapse.Face>
              <Collapse.Content>
                <Piv>{info.ammId}</Piv>
              </Collapse.Content>
            </Collapse>
          )}
        </For>
      </Piv>
    </Piv>
  )
}
