import { Accessor, createMemo } from 'solid-js'
import {
  Box,
  Button,
  Col,
  CollapseBox,
  CollapseBoxProps,
  Group,
  Icon,
  KitProps,
  List,
  Loop,
  Piv,
  PivChild,
  PivProps,
  Row,
  Text,
  createRef,
  icssLabelTitle,
  icssSubContent,
  icssClickable,
  icssCyberpenkBackground,
  icssCyberpenkBorder,
  useElementSize,
  useKitProps,
} from '@edsolater/pivkit'
import { PoolItemFaceDetailInfoBoard } from '../pageComponents/PoolPage'
import { ItemList } from '../utils/dataTransmit/itemMethods'
import toUsdVolume from '../utils/format/toUsdVolume'
import { BoardTitle } from './BoardTitle'

type TabelCellConfigs<T> = {
  category: string
  place: 'collapse-face' | 'collapse-content'
  get: (item: T, idx: Accessor<number>) => PivChild
}[]

/**
 * main page components
 *
 *
 * show a list of items in CyberPanel
 */
export function DatabaseTable<T>(
  kitProps: KitProps<
    {
      items: ItemList<T>
      // essiential for collection/favorite system
      getItemKey: (item: T) => string

      tabelCellConfigs: TabelCellConfigs<T>

      sectionTitle: string
      tableName?: string
      subtitleDescription?: string

      TopMiddle?: PivChild
      TopRight?: PivChild
      TableBodyTopLeft?: PivChild
      TableBodyTopMiddle?: PivChild
      TableBodyTopRight?: PivChild
      CollapseBoxProps?: CollapseBoxProps
      renderItem?: (item: T) => PivChild
    },
    { noNeedDeAccessifyProps: ['getItemKey'] }
  >,
) {
  const { props, shadowProps } = useKitProps(kitProps, {
    name: 'DatabaseTable',
    noNeedDeAccessifyProps: ['getItemKey'],
  })
  return (
    <Col icss={{ maxHeight: '100%', overflowY: 'hidden' }} shadowProps={shadowProps}>
      <BoardTitle>{props.sectionTitle}</BoardTitle>
      <CyberPanel icss={{ overflow: 'hidden', paddingInline: '24px' }}>
        <Box icss={{}}></Box>
        <List lazy items={props.items} icss={{ maxHeight: '100%', overflowY: 'scroll', overflowX: 'hidden' }}>
          {(item) => (
            <Box icss={{ paddingBlock: '4px' }}>
              <CollapseBox
                shadowProps={props.CollapseBoxProps}
                icss={{
                  borderRadius: '20px',
                  overflow: 'hidden',
                }}
                // need to render multiple times to get the correct height, why not let it be a web component?
                renderFace={<DatabaseTableItemCollapseFace item={item} tabelCellConfigs={props.tabelCellConfigs} />}
                renderContent={
                  <DatabaseTableItemCollapseContent item={item} tabelCellConfigs={props.tabelCellConfigs} />
                }
              />
            </Box>
          )}
        </List>
      </CyberPanel>
    </Col>
  )
}

function DatabaseTableItemCollapseFace<T>(kitProps: KitProps<{ item: T; tabelCellConfigs: TabelCellConfigs<T> }>) {
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
          icss={[icssClickable, { margin: 'auto', alignSelf: 'center' }]}
        />
      </Box>

      {/* <PoolItemFaceTokenAvatarLabel info={kitProps.item} /> */}

      <Loop of={props.tabelCellConfigs}>
        {(config, idx) => {
          const i = props.item as T // TODO: fix this without `as`
          const value = config.get(i, idx)
          return (
            <Box icss={{ display: 'flex', alignItems: 'center' }}>
              <PoolItemFaceDetailInfoBoard name={config.category} value={value} />
            </Box>
          )
        }}
      </Loop>
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

function DatabaseTableItemCollapseContent<T>(kitProps: KitProps<{ item: T; tabelCellConfigs: TabelCellConfigs<T> }>) {
  const { props, shadowProps } = useKitProps(kitProps, { name: 'PoolItemContent' })
  const isFavourite = () => false
  return (
    <Row
      icss={{
        background: 'linear-gradient(126.6deg, rgba(171, 196, 255, 0.12), rgb(171 196 255 / 4%) 100%)',
        justifyContent: 'space-between',
      }}
    >
      <Group
        name='collapse detail infos'
        icss={{
          paddingBlock: '20px',
          paddingInline: '24px',
          gap: '4vw',
          flexGrow: 1,
          justifyContent: 'space-between',
        }}
      >
        <Row>
          <Box icss={{ flexGrow: 1 }}>
            <Text icss={[{ marginBottom: '4px' }, icssLabelTitle]}>Your Liquidity</Text>
            <Text icss={icssSubContent}>
              {toUsdVolume(11000)}
              {/* {toUsdVolume(toTotalPrice(balances[info.lpMint], prices[info.lpMint]))} */}
            </Text>
            {/* <div className="text-[rgba(171,196,255,0.5)] font-medium text-sm mobile:text-2xs">
              {isHydratedPoolItemInfo(info) ? toString(balances[info.lpMint] ?? 0) + ' LP' : '--'}
            </div> */}
          </Box>
        </Row>
      </Group>

      <Row
        icss={{
          paddingBlock: '8px',
          paddingInline: '24px',
          gap: '12px',
          justifyContent: 'center',
        }}
      >
        <Button
          onClick={() => {
            // routeTo('/liquidity/add', {
            //   queryProps: {
            //     ammId: info.ammId,
            //   },
            // })
          }}
        >
          Add Liquidity
        </Button>
        {/* <Tooltip>
          <Icon
            size='smi'
            iconSrc='/icons/pools-farm-entry.svg'
            className={`grid place-items-center w-10 h-10 mobile:w-8 mobile:h-8 ring-inset ring-1 mobile:ring-1 ring-[rgba(171,196,255,.5)] rounded-xl mobile:rounded-lg text-[rgba(171,196,255,.5)] clickable-filter-effect ${
              correspondingFarm ? 'clickable' : 'not-clickable'
            }`}
            onClick={() => {
              routeTo('/farms', {
                //@ts-expect-error no need to care about enum of this error
                queryProps: objectShakeFalsy({
                  currentTab: correspondingFarm?.category ? capitalize(correspondingFarm?.category) : undefined,
                  newExpandedItemId: toPubString(correspondingFarm?.id),
                  searchText: info.lpMint,
                }),
              })
            }}
          />
          <Tooltip.Panel>Farm</Tooltip.Panel>
        </Tooltip>
        <Tooltip>
          <Icon
            size='smi'
            iconSrc='/icons/pools-remove-liquidity-entry.svg'
            className={`grid place-items-center w-10 h-10 mobile:w-8 mobile:h-8 ring-inset ring-1 mobile:ring-1 ring-[rgba(171,196,255,.5)] rounded-xl mobile:rounded-lg text-[rgba(171,196,255,.5)] ${
              hasLp ? 'opacity-100 clickable clickable-filter-effect' : 'opacity-50 not-clickable'
            }`}
            onClick={() => {
              hasLp &&
                routeTo('/liquidity/add', {
                  queryProps: {
                    ammId: info.ammId,
                    mode: 'removeLiquidity',
                  },
                })
            }}
          />
          <Tooltip.Panel>Remove Liquidity</Tooltip.Panel>
        </Tooltip> */}
        {/* <Tooltip>
          <Icon
            iconSrc='/icons/msic-swap-h.svg'
            size='smi'
            className='grid place-items-center w-10 h-10 mobile:w-8 mobile:h-8 ring-inset ring-1 mobile:ring-1 ring-[rgba(171,196,255,.5)] rounded-xl mobile:rounded-lg text-[rgba(171,196,255,.5)] clickable clickable-filter-effect'
            onClick={() => {
              routeTo('/swap', {
                queryProps: {
                  coin1: info.base,
                  coin2: info.quote,
                },
              })
            }}
          />
          <Tooltip.Panel>Swap</Tooltip.Panel>
        </Tooltip> */}
      </Row>
    </Row>
  )
}

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
        icssCyberpenkBackground,
        icssCyberpenkBorder({ borderRadius: '24px' }),
      ]}
      shadowProps={props}
    />
  )
}
