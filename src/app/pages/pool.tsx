import { Box, CollapseBox, KitProps, Row, useKitProps } from '@edsolater/pivkit'
import { useElementResize } from '../../packages/pivkit/domkit/hooks/useElementResize'
import {
  DatabaseTableItemCollapseContent,
  DatabaseTableItemCollapseFace,
  DatabaseTableList,
  type TabelCellConfigs,
} from '../components/DatabaseTableWidget'
import { Token } from '../components/TokenProps'
import { createStorePropertySignal } from '../stores/data/store'
import { PairInfo } from '../stores/data/types/pairs'
import { parseICSSToClassName } from '../../packages/pivkit'

const databaseItemFacePartTextDetailInnerStyle = parseICSSToClassName({ width: 'fit-content' })

export function DatabaseItemFacePartTextDetail(
  kitProps: KitProps<{ onResize?({ entry, el }): void; name: string; value?: any }>,
) {
  const { props, shadowProps } = useKitProps(kitProps, { name: 'DatabaseListItemFaceDetailInfoBoard' })
  const { ref: resizeRef } = useElementResize(({ entry, el }) => {
    props.onResize?.({ entry, el })
  })
  return (
    <Box shadowProps={shadowProps}>
      <Box class={'itemInnerBox'} domRef={resizeRef} icss={databaseItemFacePartTextDetailInnerStyle}>
        {props.value || '--'}
      </Box>
    </Box>
  )
}

export function DatabaseItemFacePartTokenAvatarLabel(kitProps: KitProps<{ info?: PairInfo }>) {
  const { props, shadowProps } = useKitProps(kitProps, { name: 'DatabaseListItemFaceTokenAvatarLabel' })
  return (
    <Box>
      <Token />
    </Box>
  )
}

export default function PoolsPage() {
  const pairInfos = createStorePropertySignal((s) => s.pairInfos)
  const tabelItemRowConfig: TabelCellConfigs<PairInfo> = [
    {
      name: 'Pool',
      in: 'face',
      get: (i) => (
        <Row>
          <DatabaseItemFacePartTokenAvatarLabel info={i} />
        </Row>
      ),
    },
    {
      name: 'liquidity',
      in: 'face',
      get: (i) => <DatabaseItemFacePartTextDetail name='liquidity' value={i.liquidity} />,
    },
  ]
  return (
    <DatabaseTableList
      title='Pools'
      items={pairInfos}
      getKey={(i) => i.ammId}
      renderItem={(item) => (
        <Box icss={{ paddingBlock: '4px' }}>
          <CollapseBox
            icss={{
              borderRadius: '20px',
              overflow: 'hidden',
            }}
            // need to render multiple times to get the correct height, why not let it be a web component?
            renderFace={
              <DatabaseTableItemCollapseFace key={item.ammId} item={item} tabelItemRowConfig={tabelItemRowConfig} />
            }
            renderContent={<DatabaseTableItemCollapseContent item={item} tabelItemRowConfig={tabelItemRowConfig} />}
          />
        </Box>
      )}
      tabelItemRowConfig={tabelItemRowConfig}
    />
  )
}
