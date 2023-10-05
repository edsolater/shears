import { createMemo } from 'solid-js'
import { NavBar } from '../components/NavBar'
import { useDataStore } from '../stores/data/store'
import { createRef, useElementSize, Piv, List, Collapse } from '../../packages/pivkit'

export default function PairsPanel() {
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
          borderRadius: '4px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}
      >
        <List items={dataStore.pairInfos}>
          {(info) => (
            <Collapse
              icss={{
                '&:nth-child(even)': { background: '#8080802e' },
              }}
            >
              <Collapse.Face>
                <Piv
                  icss={{
                    display: 'grid',
                    cursor: 'pointer',
                    gridTemplateColumns: isWidthSmall() ? '120px' : '150px 500px',
                    paddingBlock: '4px',
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
