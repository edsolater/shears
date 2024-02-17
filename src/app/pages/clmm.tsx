import { Box, KitProps, Text, useKitProps } from '@edsolater/pivkit'
import { createEffect } from 'solid-js'
import { useShuck } from '../../packages/conveyor/solidjsAdapter/useShuck'
import { Token } from '../components/TokenProps'
import { clmmInfos as clmmInfosS, createStorePropertySignal } from '../stores/data/store'
import { PairInfo } from '../stores/data/types/pairs'

export function ClmmItemFaceDetailInfoBoard(kitProps: KitProps<{ name: string; value?: any }>) {
  const { props, shadowProps } = useKitProps(kitProps, { name: 'ClmmItemFaceDetailInfoBoard' })
  return <Text shadowProps={shadowProps}>{props.value || '--'}</Text>
}

export function ClmmItemFaceTokenAvatarLabel(kitProps: KitProps<{ info?: PairInfo }>) {
  const { props, shadowProps } = useKitProps(kitProps, { name: 'ClmmItemFaceTokenAvatarLabel' })
  return (
    <Box>
      <Token />
    </Box>
  )
}

export default function ClmmsPage() {
  const clmmJsonInfos = createStorePropertySignal((s) => s.clmmJsonInfos)
  const [clmmInfos] = useShuck(clmmInfosS)
  createEffect(() => {
    const infos = clmmInfos()
    if (infos) {
      const key = Object.keys(infos)[0]
      console.log('🧪🧪 first clmmJson: ', { ...infos[key] })
    }
  })
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
    // <DatabaseTable
    //   sectionTitle='Clmms'
    //   items={clmmJsonInfos}
    //   getItemKey={(i) => i.id}
    //   tabelCellConfigs={[
    //     {
    //       category: 'Clmm',
    //       place: 'collapse-face',
    //       get: (i) => (
    //         <Row>
    //           <ClmmItemFaceTokenAvatarLabel info={i} />
    //         </Row>
    //       ),
    //     },
    //     {
    //       category: 'liquidity',
    //       place: 'collapse-face',
    //       get: (i) => <ClmmItemFaceDetailInfoBoard name='liquidity' value={i.liquidity} />,
    //     },
    //   ]}
    // />
    <></>
  )
}
