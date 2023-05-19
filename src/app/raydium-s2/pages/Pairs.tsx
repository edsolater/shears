import { createMemo } from 'solid-js'
import { Piv } from '../../../packages/piv'
import { Collapse, createRef, List, useElementSize } from '../../../packages/pivkit'
import { NavBar } from '../components/NavBar'
import { useDataStore } from '../stores/data/store'

export function PairsPanel() {
  const dataStore = useDataStore()
  // -------- determine size  --------
  const [ref, setRef] = createRef<HTMLElement>()
  const { width, height } = useElementSize(ref)
  const isHeightSmall = createMemo(() => (height() ?? Infinity) < 500)
  const isWidthSmall = createMemo(() => (width() ?? Infinity) < 800)

  return (
    <Piv>
      <NavBar title='Pools' />
      <Piv
        domRef={setRef}
        icss={{
          // boxShadow: icssSmoothBoxShadow,
          borderRadius: 4,
          display: 'flex',
          flexDirection: 'column',
          gap: 4
        }}
      >
        <List items={dataStore.pairInfos}>
          {(info) => (
            <Collapse
              icss={{
                '&:nth-child(even)': { background: '#8080802e' }
              }}
            >
              <Collapse.Face>
                <Piv
                  icss={{
                    display: 'grid',
                    cursor: 'pointer',
                    gridTemplateColumns: isWidthSmall() ? '120px' : '150px 500px',
                    paddingBlock: 4
                  }}
                >
                  <Piv>{info.name}</Piv>
                </Piv>
              </Collapse.Face>
              <Collapse.Content>
                <Piv icss={{ border: 'solid gray' }}>{info.ammId}</Piv>
              </Collapse.Content>
            </Collapse>
          )}
        </List>
      </Piv>
    </Piv>
  )
}
