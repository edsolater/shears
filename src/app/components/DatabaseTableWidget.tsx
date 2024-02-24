import {
  Box,
  Button,
  Col,
  CollapseBox,
  CollapseBoxProps,
  Group,
  ICSS,
  Icon,
  KitProps,
  Piv,
  PivChild,
  PivProps,
  Row,
  Text,
  createICSS,
  createRef,
  icssClickable,
  icssCyberpenkBackground,
  icssCyberpenkBorder,
  icssLabelTitle,
  icssSubContent,
  useElementSize,
  useKitProps,
} from '@edsolater/pivkit'
import { Accessor, createContext, createEffect, createMemo, createSignal, useContext } from 'solid-js'
import { List, Loop, icssItemRowGrid, icssThreeSlotGrid } from '../../packages/pivkit'
import { DatabaseItemFacePartTextDetail } from '../pages/pool'
import { colors } from '../theme/colors'
import { scrollbarWidth } from '../theme/misc'
import { ItemList } from '../utils/dataTransmit/itemMethods'
import toUsdVolume from '../utils/format/toUsdVolume'
import { Title } from './BoardTitle'

type TabelCellConfigs<T> = {
  name: string
  in: 'face' | 'content'
  get: (item: T, idx: Accessor<number>) => PivChild
}[]

type DatabaseTableWidgetProps<T> = {
  items: ItemList<T>
  // essiential for collection/favorite system
  getKey: (item: T) => string
  tabelCellConfigs: TabelCellConfigs<T>
  title: string
  subtitle?: string
  subtitleDescription?: string
  SubtitleActions?: PivChild
  TopMiddle?: PivChild
  TopRight?: PivChild
  TableBodyTopLeft?: PivChild
  TableBodyTopMiddle?: PivChild
  TableBodyTopRight?: PivChild
  CollapseBoxProps?: CollapseBoxProps
  renderItem?: (item: T) => PivChild
}

type RowWidths = number[]

export interface DatabaseTabelWidgetContextContent {
  databaseTableGridTemplate?: Accessor<ICSS>
  setItemPiecesWidth: (key: string, idx: number, width: number) => void
}

export const DatabaseTableWidgetContext = createContext<DatabaseTabelWidgetContextContent>(
  { setItemPiecesWidth: (key: string, idx: number, width: number) => {} },
  { name: 'ListController' },
)

/**
 * main page components
 *
 *
 * show a list of items in CyberPanel
 */
export function DatabaseTableWidget<T>(
  kitProps: KitProps<DatabaseTableWidgetProps<T>, { noNeedDeAccessifyProps: ['getKey'] }>,
) {
  const { props, shadowProps } = useKitProps(kitProps, {
    name: 'DatabaseTable',
    noNeedDeAccessifyProps: ['getItemKey'],
  })
  const headers = () => props.tabelCellConfigs.map((config) => config.name)
  const [itemWidthRecord, setItemWidthRecord] = createSignal<Record<string, RowWidths>>({}) //TODO: handle with record
  const itemWidthMaxRecord = createMemo(
    () => {
      const record = itemWidthRecord()
      const maxRecord: number[] = []
      for (const key in record) {
        const widths = record[key]
        widths.forEach((width, idx) => {
          maxRecord[idx] = maxRecord[idx] ? Math.max(maxRecord[idx], width) : width
        })
      }
      return maxRecord
    },
    [],
    { equals: (prev, next) => prev.length === next.length && prev.every((v, idx) => v === next[idx]) },
  )

  // dynamic css slot config
  const itemGridTemplate = createMemo(() => {
    const maxRecord = itemWidthMaxRecord()
    return headers()
      .map((n, idx) => {
        const width = maxRecord[idx]
        return width ? `${width.toFixed(0)}fr` : 'auto'
      })
      .join(' ')
  })

  const databaseTableGridTemplateICSS = () => icssItemRowGrid({ itemWidths: itemWidthMaxRecord() })

  const headerICSS = () => [
    // TODO: should also in createICSS
    { '& > *': { paddingInline: '8px' } },
    databaseTableGridTemplateICSS(),
  ]
  const databaseTableWidgetContextContent: DatabaseTabelWidgetContextContent = {
    databaseTableGridTemplate: databaseTableGridTemplateICSS,
    setItemPiecesWidth: (key, index, width) => {
      setItemWidthRecord((record) => {
        const widths = record[key] ?? []
        widths[index] = width
        return { ...record, [key]: widths }
      })
    },
  }
  return (
    <DatabaseTableWidgetContext.Provider value={databaseTableWidgetContextContent}>
      <Col icss={{ maxHeight: '100%', overflowY: 'hidden' }} shadowProps={shadowProps}>
        <Box icss={icssThreeSlotGrid}>
          <Title icss={{ color: colors.textPrimary }}>{props.title}</Title>
          <Box>{props.TopMiddle}</Box>
          <Box>{props.TopRight}</Box>
        </Box>
        <CyberPanel icss={{ overflow: 'hidden', paddingInline: '24px' }}>
          <Group name='subtitle'>
            <Title>{props.subtitle}</Title>
            <Text>{props.subtitleDescription}</Text>
          </Group>

          <Group
            name='table-header'
            icss={{
              display: 'flex',
              paddingInline: '16px',
              paddingBlock: '8px',
              borderRadius: '12px',
              background: colors.listHeaderBg,
            }}
          >
            {/* collect star */}
            <Box icss={{ width: '32px' }}></Box>

            <Box icss={[{ flexGrow: 1 }, headerICSS()]}>
              <Loop of={headers}>
                {(headerLabel) => <Text icss={{ fontWeight: 'bold', color: colors.textSecondary }}>{headerLabel}</Text>}
              </Loop>
            </Box>
          </Group>

          <Group name='items'>
            <List
              async
              items={props.items}
              icss={{
                maxHeight: '100%',
                overflowY: 'scroll',
                overflowX: 'hidden',
                marginRight: `-${scrollbarWidth}px`,
              }}
            >
              {(item) => (
                <Box icss={{ paddingBlock: '4px' }}>
                  <CollapseBox
                    shadowProps={props.CollapseBoxProps}
                    icss={{
                      borderRadius: '20px',
                      overflow: 'hidden',
                    }}
                    // need to render multiple times to get the correct height, why not let it be a web component?
                    renderFace={
                      <DatabaseTableItemCollapseFace
                        key={kitProps.getKey(item)}
                        item={item}
                        tabelCellConfigs={props.tabelCellConfigs}
                      />
                    }
                    renderContent={
                      <DatabaseTableItemCollapseContent item={item} tabelCellConfigs={props.tabelCellConfigs} />
                    }
                  />
                </Box>
              )}
            </List>
          </Group>
        </CyberPanel>
      </Col>
    </DatabaseTableWidgetContext.Provider>
  )
}

function ItemStarIcon() {
  const isFavourite = () => false
  return (
    <Box
      icss={{
        width: '24px',
        alignSelf: 'center',
      }}
    >
      <Icon
        src={isFavourite() ? '/icons/misc-star-filled.svg' : '/icons/misc-star-empty.svg'}
        onClick={({ ev }) => {
          ev.stopPropagation() // onUnFavorite?.(deAccessify(props.item).ammId)
          // onStartFavorite?.(deAccessify(props.item).ammId)
        }}
        icss={[
          icssClickable,
          {
            margin: 'auto',
            alignSelf: 'center',
          },
        ]}
      />
    </Box>
  )
}

function DatabaseTableItemCollapseFace<T>(
  kitProps: KitProps<{ key: string; item: T; tabelCellConfigs: TabelCellConfigs<T> }>,
) {
  // console.count('DatabaseTableItemCollapseFace') // TODO: why render so many times
  const { props, shadowProps } = useKitProps(kitProps, { name: 'DatabaseTableItemCollapseFace' })
  const { databaseTableGridTemplate, setItemPiecesWidth } = useContext(DatabaseTableWidgetContext)

  return (
    <Row
      shadowProps={shadowProps}
      icss={[
        {
          paddingBlock: '20px',
          paddingInline: '16px',
          background: colors.listItemBg,
          transition: 'all 150ms',
        },
      ]}
    >
      <Box icss={{ width: '24px', marginRight: '8px' }}>
        <ItemStarIcon />
      </Box>

      <Group name='item-parts' icss={[{ flex: 1 }, databaseTableGridTemplate?.()]}>
        <Loop of={props.tabelCellConfigs}>
          {(config, idx) => (
            <DatabaseItemFacePartTextDetail
              name={config.name}
              value={config.get(props.item, idx)}
              onResize={({ entry, el }) => {
                setItemPiecesWidth(props.key, idx(), entry.contentRect.width)
              }}
            />
          )}
        </Loop>
      </Group>
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
