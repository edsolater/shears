import { Show, createEffect, createMemo } from 'solid-js'
import {
  Accessify,
  Box,
  Col,
  CollapseBox,
  Icon,
  ItemBox,
  KitProps,
  List,
  Piv,
  PivChild,
  PivProps,
  Row,
  Text,
  createRef,
  deAccessify,
  icss_clickable,
  icss_cyberpenkBackground,
  icss_cyberpenkBorder,
  useElementSize,
  useKitProps,
} from '../../packages/pivkit'
import { BoardTitle } from '../components/BoardTitle'
import { TokenAvatar } from '../components/TokenAvatar'
import { Token } from '../components/TokenProps'
import { createStorePropertySignal } from '../stores/data/store'
import { PairInfo } from '../stores/data/types/pairs'
import { ItemList } from '../utils/dataTransmit/itemMethods'
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

type PoolItemFaceProps = KitProps<{ item: PairInfo }>

function PoolItemFace(kitProps: PoolItemFaceProps) {
  const { props, shadowProps } = useKitProps(kitProps, { name: 'PoolItemFace' })
  const isFavourite = () => false
  return (
    <Row
      shadowProps={shadowProps}
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
        <Icon
          src={isFavourite() ? '/icons/misc-star-filled.svg' : '/icons/misc-star-empty.svg'}
          onClick={({ ev }) => {
            ev.stopPropagation()
            // onUnFavorite?.(deAccessify(props.item).ammId)
            // onStartFavorite?.(deAccessify(props.item).ammId)
          }}
          icss={[icss_clickable, { margin: 'auto', alignSelf: 'center' }]}
        />
      </Box>

      <PoolItemFaceTokenAvatarLabel info={kitProps.item} />

      <PoolItemFaceDetailInfoBoard name='Liquidity' value={1231} />
      {/*<TextInfoItem
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

function PoolItemFaceDetailInfoBoard(kitProps: KitProps<{ name: string; value?: any }>) {
  const { props, shadowProps } = useKitProps(kitProps, { name: 'DatabaseListItemFaceDetailInfoBoard' })
  return <Text shadowProps={shadowProps}>{props.value || '--'}</Text>
}

function PoolItemFaceTokenAvatarLabel(kitProps: KitProps<{ info?: PairInfo }>) {
  const { props, shadowProps } = useKitProps(kitProps, { name: 'DatabaseListItemFaceTokenAvatarLabel' })
  return (
    <Box>
      <Token />
    </Box>
  )
}

type PoolItemContentProps<T> = KitProps<{ item: T }>

function PoolItemContent<T>(kitProps: PoolItemContentProps<T>) {
  const { props, shadowProps } = useKitProps(kitProps, { name: 'PoolItemContent' })
  const isFavourite = () => false
  return (
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
  )
}

function DatabaseTable<T>(
  kitProps: KitProps<{
    items: ItemList<T>
    title: string
    subtitle?: string
    subtitleDescription?: string
    renderTopMiddle?: PivChild
    renderTopRight?: PivChild
    renderTableBodyTopLeft?: PivChild
    renderTableBodyTopMiddle?: PivChild
    renderTableBodyTopRight?: PivChild
    renderCollapseItemFace?: (item: T) => PivChild
    renderCollapseItemContent?: (item: T) => PivChild
    renderItem?: (item: T) => PivChild
  }>,
) {
  const { props, shadowProps } = useKitProps(kitProps, { name: 'DatabaseTable' })
  return (
    <Col shadowProps={shadowProps}>
      <BoardTitle>{props.title}</BoardTitle>
      <CyberPanel>
        <List items={props.items}>
          {(item) => (
            <CollapseBox
              icss={{
                borderRadius: '12px',
                overflow: 'hidden',
                paddingBlock: '4px', // TODO: should be a props of `<List>`
                marginInline: '24px',
              }}
              renderFace={<PoolItemFace item={item} />} // FIXME
              renderContent={<PoolItemContent item={item} />}
            />
          )}
        </List>
      </CyberPanel>
    </Col>
  )
}

export default function AmmPoolsPage() {
  const pairInfos = createStorePropertySignal((s) => s.pairInfos)
  return <DatabaseTable title='Pools' items={pairInfos} />
}
