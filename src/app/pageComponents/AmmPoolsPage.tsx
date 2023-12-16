import { Show, createEffect, createMemo } from 'solid-js'
import {
  Accessify,
  Box,
  Col,
  CollapseBox,
  Icon,
  ItemBox,
  List,
  Piv,
  PivChild,
  PivProps,
  Row,
  createRef,
  deAccessify,
  icss_clickable,
  icss_cyberpenkBackground,
  icss_cyberpenkBorder,
  useElementSize,
} from '../../packages/pivkit'
import { BoardTitle } from '../components/BoardTitle'
import { TokenAvatar } from '../components/TokenAvatar'
import { Token } from '../components/TokenProps'
import { createStorePropertySignal } from '../stores/data/store'
import { PairJson } from '../stores/data/types/pairs'
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
function DatabaseListItemFace<T>(props: { item: Accessify<T>; renderItem?: (item: T) => PivChild }) {
  const renderItem = props.renderItem as InfoFaceRowItemProps<T>['renderItem']
  const isFavourite = () => false
  return (
    <Row
      icss={{
        paddingBlock: '20px',
        background: '#141041',
        gap: '8px',
        display: 'grid',
        gridTemplateColumns: 'auto 1.6fr 1fr 1fr 1fr .8fr auto',
        borderRadius: '20px 20px 0 0',
        transition: 'all 150ms',
      }}
    >
      <Box
        icss={{
          width: '24px',
          alignSelf: 'center',
          marginLeft: '24px',
          marginRight: '8px',
        }}
      >
        <Show when={isFavourite()}>
          <Icon
            src='/icons/misc-star-filled.svg'
            onClick={({ ev }) => {
              ev.stopPropagation()
              // onUnFavorite?.(deAccessify(props.item).ammId)
            }}
            icss={[icss_clickable, { margin: 'auto', alignSelf: 'center' }]}
          />
        </Show>

        <Show when={!isFavourite()}>
          <Icon
            src='/icons/misc-star-empty.svg'
            onClick={({ ev }) => {
              ev.stopPropagation()
              // onStartFavorite?.(deAccessify(props.item).ammId)
            }}
            icss={[icss_clickable, { margin: 'auto', alignSelf: 'center' }]}
          />
        </Show>
      </Box>

      <ItemBox>
        <DatabaseListItemFaceTokenAvatarLabel info={props.item} />
      </ItemBox>

      {/* <TextInfoItem name='Liquidity' value={liquidityInfo()} />
      <TextInfoItem
        name={`Volume(${timeBasis})`}
        value={
          timeBasis === '24H'
            ? toUsdVolume((correspondingJsonInfo ?? info).volume24h, { autoSuffix: isTablet, decimalPlace: 0 })
            : timeBasis === '7D'
              ? toUsdVolume((correspondingJsonInfo ?? info).volume7d, { autoSuffix: isTablet, decimalPlace: 0 })
              : toUsdVolume((correspondingJsonInfo ?? info).volume30d, { autoSuffix: isTablet, decimalPlace: 0 })
        }
      />
      <TextInfoItem
        name={`Fees(${timeBasis})`}
        value={
          timeBasis === '24H'
            ? toUsdVolume((correspondingJsonInfo ?? info).fee24h, { autoSuffix: isTablet, decimalPlace: 0 })
            : timeBasis === '7D'
              ? toUsdVolume((correspondingJsonInfo ?? info).fee7d, { autoSuffix: isTablet, decimalPlace: 0 })
              : toUsdVolume((correspondingJsonInfo ?? info).fee30d, { autoSuffix: isTablet, decimalPlace: 0 })
        }
      />
      <TextInfoItem
        name={`APR(${timeBasis})`}
        value={
          timeBasis === '24H'
            ? formatApr((correspondingJsonInfo ?? info).apr24h, { alreadyPercented: true })
            : timeBasis === '7D'
              ? formatApr((correspondingJsonInfo ?? info).apr7d, { alreadyPercented: true })
              : formatApr((correspondingJsonInfo ?? info).apr30d, { alreadyPercented: true })
        }
      />
      <Grid className='w-9 h-9 mr-8 place-items-center'>
        <Icon size='sm' heroIconName={`${open ? 'chevron-up' : 'chevron-down'}`} />
      </Grid> */}
    </Row>
  )
}

function DatabaseListItemFaceTokenAvatarLabel(props: { info: Accessify<PairJson | undefined> }) {
  // const isMobile = useAppSettings((s) => s.isMobile)
  // const [isDetailReady, setIsDetailReady] = useState(false)

  // useEffect(() => {
  //   if (isHydratedPoolItemInfo(info) && info?.base && info.quote) {
  //     setIsDetailReady(true)
  //   }
  // }, [isHydratedPoolItemInfo(info) && info?.base, isHydratedPoolItemInfo(info) && info?.quote])

  return (
    <Row>
      <Token />
    </Row>
  )
}

function DatabaseTable<T>(props: {
  items: Accessify<IterableIterator<T>>
  title: Accessify<string>
  subtitle?: Accessify<string>
  subtitleDescription?: Accessify<string>
  renderTopMiddle?: Accessify<PivChild>
  renderTopRight?: Accessify<PivChild>
  renderTableBodyTopLeft?: Accessify<PivChild>
  renderTableBodyTopMiddle?: Accessify<PivChild>
  renderTableBodyTopRight?: Accessify<PivChild>
  renderItem?: (item: T) => PivChild
}) {
  createEffect(() => {
    console.log('props.items: ', deAccessify(props.items))
  })
  return (
    <Col>
      <BoardTitle>{props.title}</BoardTitle>
      <CyberPanel>
        <List items={[1, 2, 3]}>
          {(item) => (
            <CollapseBox
              icss={{
                borderRadius: '12px',
                overflow: 'hidden',
                paddingBlock: '4px', // TODO: should be a props of `<List>`
                marginInline: '24px',
              }}
              renderFace={<DatabaseListItemFace item={item} />}
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
          )}
        </List>
      </CyberPanel>
    </Col>
  )
}

export default function AmmPoolsPage() {
  const pairInfos = createStorePropertySignal((s) => s.pairInfos)
  return <DatabaseTable title='Pools' items={[]} />
}
