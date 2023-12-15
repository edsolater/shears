import { createEffect, createMemo } from 'solid-js'
import {
  Box,
  Col,
  CollapseBox,
  List,
  Piv,
  PivProps,
  createRef,
  icss_cyberpenkBackground,
  icss_cyberpenkBorder,
  useElementSize,
} from '../../packages/pivkit'
import { createStorePropertySignal } from '../stores/data/store'
import { PageTitle } from '../components/PageTitle'
function CyberPanel(props: PivProps) {
  // -------- determine size  --------
  const [ref, setRef] = createRef<HTMLElement>()
  const { width, height } = useElementSize(ref)
  const isHeightSmall = createMemo(() => (height() ?? Infinity) < 500)
  const isWidthSmall = createMemo(() => (width() ?? Infinity) < 800)
  return (
    <Piv
      domRef={setRef}
      icss={[
        {
          borderRadius: '24px',
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
        },
        icss_cyberpenkBackground,
        icss_cyberpenkBorder({ borderRadius: '24px' }),
      ]}
      shadowProps={props}
    />
  )
}
// TODO: 
function CyberTable(props) {}

export default function AmmPoolsPage() {
  const pairInfos = createStorePropertySignal((s) => s.pairInfos)
  createEffect(() => {
    console.log('pairInfos(): ', pairInfos())
  })
  return (
    <Col>
      <PageTitle icss={{ marginBottom: '16px' }}>Pools</PageTitle>
      <CyberPanel>
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
        {/* <List items={pairInfos}>
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
                    gridTemplateColumns: '150px 500px',
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
        </List> */}
      </CyberPanel>
    </Col>
  )
}
