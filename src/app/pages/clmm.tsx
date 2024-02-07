import { Box, KitProps, Row, Text, useKitProps } from '@edsolater/pivkit'
import { DatabaseTable } from '../components/DatabaseTable'
import { Token } from '../components/TokenProps'
import { createStorePropertySignal } from '../stores/data/store'
import { PairInfo } from '../stores/data/types/pairs'

export function ClmmItemFaceDetailInfoBoard(kitProps: KitProps<{ name: string; value?: any }>) {
  const { props, shadowProps } = useKitProps(kitProps, { name: 'DatabaseListItemFaceDetailInfoBoard' })
  return <Text shadowProps={shadowProps}>{props.value || '--'}</Text>
}

export function ClmmItemFaceTokenAvatarLabel(kitProps: KitProps<{ info?: PairInfo }>) {
  const { props, shadowProps } = useKitProps(kitProps, { name: 'DatabaseListItemFaceTokenAvatarLabel' })
  return (
    <Box>
      <Token />
    </Box>
  )
}

export default function ClmmsPage() {
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
    <DatabaseTable
      sectionTitle='Clmms'
      items={pairInfos}
      getItemKey={(i) => i.ammId}
      tabelCellConfigs={[
        {
          category: 'Clmm',
          place:'collapse-face',  
          get: (i) => (
            <Row>
              <ClmmItemFaceTokenAvatarLabel info={i} />
            </Row>
          ),
        },
        {
          category: 'liquidity',
          place:'collapse-face',  
          get: (i) => <ClmmItemFaceDetailInfoBoard name='liquidity' value={i.liquidity} />,
        },
      ]}
    />
  )
}
