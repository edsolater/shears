import { createMemo, For, Show } from 'solid-js'
import { Piv } from '../../../packages/piv'
import { createRef, useElementSize } from '../../../packages/pivkit'
import { NavBar } from '../components/NavBar'
import { usePairsAtom } from '../atoms/pairs/atom'

export function PairsPanel() {
  const pairsAtom = usePairsAtom()
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
        <For each={pairsAtom.infos}>
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
