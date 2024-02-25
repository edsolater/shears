import { Box, KitProps, Row, useKitProps } from '@edsolater/pivkit'
import { useElementResize } from '../../packages/pivkit/domkit/hooks/useElementResize'
import { DatabaseTableList } from '../components/DatabaseTableWidget'
import { Token } from '../components/TokenProps'
import { createStorePropertySignal } from '../stores/data/store'
import { PairInfo } from '../stores/data/types/pairs'

export function DatabaseItemFacePartTextDetail(
  kitProps: KitProps<{ onResize?({ entry, el }): void; name: string; value?: any }>,
) {
  const { props, shadowProps } = useKitProps(kitProps, { name: 'DatabaseListItemFaceDetailInfoBoard' })
  const { ref: resizeRef } = useElementResize(({ entry, el }) => {
    props.onResize?.({ entry, el })
  })
  return (
    <Box shadowProps={shadowProps}>
      <Box class={'itemInnerBox'} domRef={resizeRef} icss={{ width: 'fit-content' }}>
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
  const mockItems = [
    { id: '2', name: 'se', address: '1', detail: 'detail' },
    { id: '3', name: 'lisdf', address: '33', detail: 'detail3333' },
  ] satisfies {
    id: string
    name: string
    address: string
    detail?: string
  }[]
  return (
    <DatabaseTableList
      title='Pools'
      items={pairInfos}
      getKey={(i) => i.ammId}
      tabelCellConfigs={[
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
      ]}
    />
  )
}
