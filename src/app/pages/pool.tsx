import { Box, KitProps, Row, Text, useKitProps } from '@edsolater/pivkit'
import { DatabaseTableWidget } from '../components/DatabaseTableWidget'
import { Token } from '../components/TokenProps'
import { createStorePropertySignal } from '../stores/data/store'
import { PairInfo } from '../stores/data/types/pairs'

export function PoolItemFaceDetailInfoBoard(kitProps: KitProps<{ name: string; value?: any }>) {
  const { props, shadowProps } = useKitProps(kitProps, { name: 'DatabaseListItemFaceDetailInfoBoard' })
  return <Text shadowProps={shadowProps}>{props.value || '--'}</Text>
}

export function PoolItemFaceTokenAvatarLabel(kitProps: KitProps<{ info?: PairInfo }>) {
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
    <DatabaseTableWidget
      title='Pools'
      items={pairInfos}
      getKey={(i) => i.ammId}
      tabelCellConfigs={[
        {
          name: 'Pool',
          contentExistIn:'face',  
          get: (i) => (
            <Row>
              <PoolItemFaceTokenAvatarLabel info={i} />
            </Row>
          ),
        },
        {
          name: 'liquidity',
          contentExistIn:'face',  
          get: (i) => <PoolItemFaceDetailInfoBoard name='liquidity' value={i.liquidity} />,
        },
      ]}
    />
  )
}
