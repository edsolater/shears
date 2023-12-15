import { createMemo } from 'solid-js'
import {
  Box,
  Col,
  CollapseBox,
  List,
  Piv,
  Text,
  createRef,
  icss_cyberpenkBackground,
  icss_cyberpenkBorder,
  icss_title,
  useElementSize
} from '../../packages/pivkit'
import { createStorePropertySignal } from '../stores/data/store'

export default function AmmPoolsPage() {
  const pairInfos = createStorePropertySignal((s) => s.pairInfos)
  // -------- determine size  --------
  const [ref, setRef] = createRef<HTMLElement>()
  const { width, height } = useElementSize(ref)
  const isHeightSmall = createMemo(() => (height() ?? Infinity) < 500)
  const isWidthSmall = createMemo(() => (width() ?? Infinity) < 800)
  return (
    <Col>
      <Text icss={[icss_title, { marginBottom: '16px' }]}>Pools</Text>
      <Piv
        domRef={setRef}
        icss={[
          {
            // boxShadow: icss_smoothBoxShadow,
            borderRadius: '24px',
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
          },
          icss_cyberpenkBackground,
          icss_cyberpenkBorder({ borderRadius: '24px' }),
        ]}
      >
        <CollapseBox
          icss={{
            borderRadius: '12px',
            overflow: 'hidden',
          }}
          renderFace={
            <Piv
              icss={{
                backgroundColor: '#141041',
                height: '40px',
                display: 'grid',
                placeItems: 'center',
                overflow: 'hidden',
              }}
            >
              <Box>Face</Box>
            </Piv>
          }
          renderContent={
            <Piv
              icss={{
                backgroundColor: 'dodgerblue',
                height: '100px',
                display: 'grid',
                placeItems: 'center',
                overflow: 'hidden',
              }}
            >
              <Box>Content</Box>
            </Piv>
          }
        />
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
    </Col>
  )
}
