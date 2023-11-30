import { createMemo } from 'solid-js'
import { Collapse, List, Piv, createRef, useElementSize } from '../../packages/pivkit'
import { createStorePropertySignal, setStore, store } from '../stores/data/store'

export default function PairsPage() {
  const pairInfos = createStorePropertySignal((s) => s.pairInfos)
  // -------- determine size  --------
  const [ref, setRef] = createRef<HTMLElement>()
  const { width, height } = useElementSize(ref)
  const isHeightSmall = createMemo(() => (height() ?? Infinity) < 500)
  const isWidthSmall = createMemo(() => (width() ?? Infinity) < 800)

  return (
    <Piv>
      <Piv
        domRef={setRef}
        icss={{
          // boxShadow: icss_smoothBoxShadow,
          borderRadius: '4px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}
      >
        <List items={pairInfos}>
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
