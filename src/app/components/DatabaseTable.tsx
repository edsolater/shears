import {
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
    renderCollapseItemFace?: (item: T) => PivChild
    renderCollapseItemContent?: (item: T) => PivChild
    renderItem?: (item: T) => PivChild
  }>,
) {
  const { props, shadowProps } = useKitProps(kitProps, { name: 'DatabaseTable' })
  return (
    <Col shadowProps={shadowProps}>
      <BoardTitle>{props.sectionTitle}</BoardTitle>
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
              renderFace={props.renderCollapseItemFace?.(item)}
              renderContent={props.renderCollapseItemContent?.(item)}
            />
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
