import { Box, KitProps, Text, useKitProps } from '../../packages/pivkit'
import { DatabaseTable } from '../components/DatabaseTable'
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
    { name: 'se', address: '1', detail: 'detail' },
    { name: 'lisdf', address: '33', detail: 'detail3333' },
  ] satisfies {
    name: string
    address: string
    detail?: string
  }[]
  return (
    <DatabaseTable sectionTitle='Pools' items={mockItems} tabelCellConfigs={[{ name: 'Pool', get: (i) => i.name }]} />
  )
}
