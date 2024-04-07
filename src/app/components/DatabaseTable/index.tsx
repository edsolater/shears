import {
  Box,
  Col,
  Group,
  ICSS,
  Icon,
  KitProps,
  PivChild,
  Row,
  Text,
  icssClickable,
  useKitProps,
  type ItemList,
  CollapseBox,
  icssAlignCenter,
} from "@edsolater/pivkit"
import { Accessor, createContext, createMemo, createSignal, useContext } from "solid-js"
import {
  List,
  Loop,
  icssItemRowGrid,
  icssThreeSlotGrid,
  parseICSSToClassName,
  type ListKitProps,
} from "../../../packages/pivkit"
import { icssClmmItemRow, icssClmmItemRowCollapse } from "../../pages/clmm"
import { DatabaseItemFacePartTextDetail } from "../../pages/pool"
import { colors } from "../../theme/colors"
import { scrollbarWidth } from "../../theme/misc"
import { Title } from "../BoardTitle"
import { CyberPanel } from "../CyberPanel"
import { shrinkFn } from "@edsolater/fnkit"

// for sort and search
export type TabelHeaderConfigs<T> = {
  name: string
}[]

type DatabaseTableProps<T> = {
  items: ItemList<T>
  propForList?: ListKitProps<T>
  // essiential for collection/favorite system
  getKey: (item: T) => string
  // config for sort
  headerConfig: TabelHeaderConfigs<T>
  itemRowConfig?: DatabaseTabelItemRenderConfig<T>
  itemFaceConfig: DatabaseTabelItemCollapseFaceRenderConfig<T>
  itemContentConfig: DatabaseTabelItemCollapseContentRenderConfig<T>
  title: string
  subtitle?: string
  subtitleDescription?: string

  SubtitleActions?: PivChild
  TopMiddle?: PivChild
  TopRight?: PivChild
  // TableBodyTopLeft?: PivChild
  TableBodyTopMiddle?: PivChild
  TableBodyTopRight?: PivChild
  onClickItem?: (item: T) => void
}

type RowWidths = number[]

interface DatabaseTabelContextValue {
  databaseTableGridTemplate?: Accessor<ICSS>
  setItemPiecesWidth: (key: string, idx: number, width: number) => void
}

const DatabaseTableContext = createContext<DatabaseTabelContextValue>(
  { setItemPiecesWidth: (key: string, idx: number, width: number) => {} },
  { name: "ListController" },
)

/**
 * main page components
 *
 *
 * show a list of items in CyberPanel
 */
export function DatabaseTable<T>(kitProps: KitProps<DatabaseTableProps<T>, { noNeedDeAccessifyProps: ["getKey"] }>) {
  const { props, shadowProps } = useKitProps(kitProps, {
    name: "DatabaseTable",
    noNeedDeAccessifyProps: ["getItemKey"],
  })
  const cellNames = () => props.headerConfig.map((config) => config.name)
  const [cellWidths, setItemWidthRecord] = createSignal<Record<string, RowWidths>>({})
  const cellMaxWidths = createMemo(
    () => {
      const record = cellWidths()
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

  const databaseTableGridICSS = () => icssItemRowGrid({ itemWidths: cellMaxWidths() })

  const headerICSS = () => [
    // TODO: should also in createICSS
    { "& > *": { paddingInline: "8px" } },
    databaseTableGridICSS(),
  ]
  const databaseTableContextRoot: DatabaseTabelContextValue = {
    databaseTableGridTemplate: databaseTableGridICSS,
    setItemPiecesWidth: (key, index, width) => {
      setItemWidthRecord((record) => {
        const widths = record[key] ?? []
        widths[index] = width
        return { ...record, [key]: widths }
      })
    },
  }
  return (
    <DatabaseTableContext.Provider value={databaseTableContextRoot}>
      <Col icss={{ maxHeight: "100%", overflowY: "hidden" }} shadowProps={shadowProps}>
        <Box icss={icssThreeSlotGrid}>
          <Title icss={{ color: colors.textPrimary }}>{props.title}</Title>
          <Box>{props.TopMiddle}</Box>
          <Box>{props.TopRight}</Box>
        </Box>
        <CyberPanel icss={{ overflow: "hidden", paddingInline: "24px" }}>
          <Box icss={icssThreeSlotGrid}>
            <Box>
              <Title>{props.subtitle}</Title>
              <Text>{props.subtitleDescription}</Text>
            </Box>
            <Box>{props.TableBodyTopMiddle}</Box>
            <Box>{props.TableBodyTopRight}</Box>
          </Box>

          <Group
            name="table-header"
            icss={{
              display: "flex",
              paddingInline: "16px",
              paddingBlock: "8px",
              borderRadius: "12px",
              background: colors.listHeaderBg,
            }}
          >
            {/* collect star */}
            <Box icss={{ width: "32px" }}></Box>

            <Box icss={[{ flexGrow: 1 }, headerICSS()]}>
              <Loop of={cellNames}>
                {(headerLabel) => <Text icss={{ fontWeight: "bold", color: colors.textSecondary }}>{headerLabel}</Text>}
              </Loop>
            </Box>
          </Group>

          <Group name="items">
            <List
              shadowProps={props.propForList}
              items={props.items}
              icss={{
                maxHeight: "100%",
                overflowY: "scroll",
                overflowX: "hidden",
                marginRight: `-${scrollbarWidth}px`,
              }}
            >
              {(item, idx) => (
                <DatabaseTableItem
                  item={item}
                  key={kitProps.getKey(item)}
                  headerConfig={props.headerConfig}
                  itemRowConfig={props.itemRowConfig}
                  itemFaceConfig={props.itemFaceConfig}
                  itemContentConfig={props.itemContentConfig}
                  onClickItem={props.onClickItem}
                />
              )}
            </List>
          </Group>
        </CyberPanel>
      </Col>
    </DatabaseTableContext.Provider>
  )
}

type DatabaseTabelItemRenderConfig<T> = {
  collapseTransitionDuration?: number | ((item: T) => number)
}

/**
 * components to show clmm info
 */
function DatabaseTableItem<T>(props: {
  key: string
  item: T
  headerConfig: TabelHeaderConfigs<any>
  itemRowConfig?: DatabaseTabelItemRenderConfig<T>
  itemFaceConfig: DatabaseTabelItemCollapseFaceRenderConfig<any>
  itemContentConfig: DatabaseTabelItemCollapseContentRenderConfig<any>
  onClickItem?: (item: T) => void
}) {
  return (
    <Box icss={icssClmmItemRow} class="ClmmItemRow">
      <CollapseBox
        icss={icssClmmItemRowCollapse}
        optionsOfCSSCollapse={{
          durationMs: shrinkFn(props.itemRowConfig?.collapseTransitionDuration, [props.item]),
        }}
        renderFace={() => (
          <DatabaseTableItemCollapseFace key={props.key} item={props.item} innerConfig={props.itemFaceConfig} />
        )}
        renderContent={() => (
          <DatabaseTableItemCollapseContent item={props.item} innerConfig={props.itemContentConfig} />
        )}
        onClick={() => props.onClickItem?.(props.item)}
      />
    </Box>
  )
}

const databaseTableRowCollapseFaceStyle = parseICSSToClassName([
  {
    paddingBlock: "20px",
    paddingInline: "16px",
    background: colors.listItemBg,
    transition: "all 150ms",
  },
])

export type DatabaseTabelItemCollapseFaceRenderConfig<T> = {
  name: string
  render: (item: T, idx: Accessor<number>) => PivChild
}[]

function DatabaseTableItemCollapseFace<T>(
  kitProps: KitProps<{ key: string; item: T; innerConfig: DatabaseTabelItemCollapseFaceRenderConfig<T> }>,
) {
  // console.count('DatabaseTableItemCollapseFace') // TODO: why render so many times
  const { props, shadowProps } = useKitProps(kitProps, { name: "DatabaseTableItemCollapseFace" })
  const { databaseTableGridTemplate, setItemPiecesWidth } = useContext(DatabaseTableContext)
  return (
    <Row shadowProps={shadowProps} icss={[icssAlignCenter,databaseTableRowCollapseFaceStyle]}>
      <Box icss={{ width: "24px", marginRight: "8px" }}>
        <ItemStarIcon />
      </Box>

      <Group name="item-parts" icss={[{ flex: 1 }, databaseTableGridTemplate?.()]}>
        <Loop of={props.innerConfig}>
          {(config, idx) => (
            <DatabaseItemFacePartTextDetail
              name={config.name}
              value={config.render(props.item, idx)}
              onResize={({ entry, el }) => {
                setItemPiecesWidth(props.key, idx(), entry.contentRect.width)
              }}
            />
          )}
        </Loop>
      </Group>
    </Row>
  )
} /**
 * usually used for detecting user favorite/collected
 */

export function ItemStarIcon() {
  const isFavourite = () => false
  return (
    <Box
      icss={{
        width: "24px",
        alignSelf: "center",
      }}
    >
      <Icon
        src={isFavourite() ? "/icons/misc-star-filled.svg" : "/icons/misc-star-empty.svg"}
        onClick={({ ev }) => {
          ev.stopPropagation() // onUnFavorite?.(deAccessify(props.item).ammId)

          // onStartFavorite?.(deAccessify(props.item).ammId)
        }}
        icss={[
          icssClickable,
          {
            margin: "auto",
            alignSelf: "center",
          },
        ]}
      />
    </Box>
  )
}

export type DatabaseTabelItemCollapseContentRenderConfig<T> = {
  render: (item: T) => PivChild
}
const databaseTableItemCollapseContentStyle = parseICSSToClassName({
  background: "linear-gradient(126.6deg, rgba(171, 196, 255, 0.12), rgb(171 196 255 / 4%) 100%)",
})

export function DatabaseTableItemCollapseContent<T>(
  kitProps: KitProps<{ item: T; innerConfig: DatabaseTabelItemCollapseContentRenderConfig<T> }>,
) {
  const { props, shadowProps } = useKitProps(kitProps, { name: "DatabaseTableItemCollapseContent" })
  const isFavourite = () => false
  const renderContent = props.innerConfig.render(props.item)
  return <Box icss={databaseTableItemCollapseContentStyle}>{renderContent}</Box>
}
