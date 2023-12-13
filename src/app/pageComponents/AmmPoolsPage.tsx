import { createMemo } from 'solid-js'
import { CollapseBox, List, Piv, createRef, useElementSize } from '../../packages/pivkit'
import { createStorePropertySignal } from '../stores/data/store'

export default function AmmPoolsPage() {
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
            <CollapseBox
              icss={{
                '&:nth-child(even)': { background: '#8080802e' },
              }}
            >
              <CollapseBox.Face>
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
              </CollapseBox.Face>
              <CollapseBox.Content>
                <Piv icss={{ border: 'solid gray' }}>{info.ammId}</Piv>
              </CollapseBox.Content>
            </CollapseBox>
          )}
        </List>
      </Piv>
    </Piv>
  )
}