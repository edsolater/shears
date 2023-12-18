import {
  Box,
  Col,
  CollapseBox,
  CollapseBoxProps,
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
import { BoardTitle } from './BoardTitle'
import { ItemList } from '../utils/dataTransmit/itemMethods'
import { createMemo } from 'solid-js'

/**
 * main page components
 *
 *
 * show a list of items in CyberPanel
 */
export function DatabaseTable<T>(
  kitProps: KitProps<{
    items: ItemList<T>
    sectionTitle: string
    tableName?: string
    subtitleDescription?: string
    TopMiddle?: PivChild
    TopRight?: PivChild
    TableBodyTopLeft?: PivChild
    TableBodyTopMiddle?: PivChild
    TableBodyTopRight?: PivChild
    CollapseBoxProps?: CollapseBoxProps
    renderCollapseItemFace?: (item: T) => PivChild
    renderCollapseItemContent?: (item: T) => PivChild
    renderItem?: (item: T) => PivChild
  }>,
) {
  const { props, shadowProps } = useKitProps(kitProps, { name: 'DatabaseTable' })
  return (
    <Col icss={{ maxHeight: '100%', overflowY: 'hidden' }} shadowProps={shadowProps}>
      <BoardTitle>{props.sectionTitle}</BoardTitle>
      <CyberPanel icss={{ overflow: 'hidden' }}>
        <List items={props.items} icss={{ maxHeight: '100%', overflowY: 'scroll', overflowX: 'hidden' }}>
          {(item) => (
            <Box icss={{ paddingBlock: '4px' }}>
              <CollapseBox
                shadowProps={props.CollapseBoxProps}
                icss={{
                  borderRadius: '20px',
                  overflow: 'hidden',
                  marginInline: '24px',
                }}
                renderFace={props.renderCollapseItemFace?.(item)}
                renderContent={props.renderCollapseItemContent?.(item)}
              />
            </Box>
          )}
        </List>
      </CyberPanel>
    </Col>
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
        icss_cyberpenkBackground,
        icss_cyberpenkBorder({ borderRadius: '24px' }),
      ]}
      shadowProps={props}
    />
  )
}
