import { createEffect, createMemo } from 'solid-js'
import {
  Box,
  Col,
  CollapseBox,
  KitProps,
  List,
  Piv,
  PivChild,
  PivProps,
  createRef,
  icss_cyberpenkBackground,
  icss_cyberpenkBorder,
  useElementSize,
  useKitProps,
} from '../../packages/pivkit'
import { createStorePropertySignal } from '../stores/data/store'
import { BoardTitle } from '../components/BoardTitle'
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

type InfoFaceRowItemProps<T> = {
  item: T
  renderItem: (item: T) => PivChild
}

// TODO: should continue
function InfoFaceRowItem<T>(kitProps: KitProps<InfoFaceRowItemProps<T>, { noNeedDeAccessifyProps: ['renderItem'] }>) {
  const { props } = useKitProps(kitProps, { name: 'InfoFaceRowItem', noNeedDeAccessifyProps: ['renderItem'] })
  const renderItem = props.renderItem as InfoFaceRowItemProps<T>['renderItem']
  return (
    <Piv
      icss={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        paddingInline: '8px',
        paddingBlock: '4px',
      }}
    >
      <Box>{props.renderItem}</Box>
    </Piv>
  )
}

function DatabaseTable<T>(
  kitProps: KitProps<
    {
      items: Iterable<T>
      title: string
      subtitle?: string
      subtitleDescription?: string
      renderTopMiddle?: PivChild
      renderTopRight?: PivChild
      renderTableBodyTopLeft?: PivChild
      renderTableBodyTopMiddle?: PivChild
      renderTableBodyTopRight?: PivChild
      renderItem?: (item: T) => PivChild
    },
    { noNeedDeAccessifyProps: ['renderItem'] }
  >,
) {
  const { props } = useKitProps(kitProps, { name: 'DatabaseTable' })
  return (
    <Col>
      <BoardTitle>{props.title}</BoardTitle>
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

export default function AmmPoolsPage() {
  const pairInfos = createStorePropertySignal((s) => s.pairInfos)
  return <DatabaseTable title='Pools' items={[]} />
}
