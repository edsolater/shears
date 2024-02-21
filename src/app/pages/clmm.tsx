import { Box, KitProps, Row, Text, useKitProps } from '@edsolater/pivkit'
import { createEffect } from 'solid-js'
import { useShuck } from '../../packages/conveyor/solidjsAdapter/useShuck'
import { Loop, Tab, TabList, Tabs } from '../../packages/pivkit'
import { DatabaseTableWidget } from '../components/DatabaseTableWidget'
import { Token } from '../components/TokenProps'
import { useToken } from '../stores/data/dataHooks/useToken'
import {
  allClmmTabs,
  createStorePropertySignal,
  s_clmmInfos,
  s_isMobile,
  s_uiCurrentClmmTab,
} from '../stores/data/store'
import type { PairInfo } from '../stores/data/types/pairs'
import { getToken } from '../stores/data/utils/getToken'

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
  const clmmJsonInfos = createStorePropertySignal((s) => s.clmmJsonInfos) // start to load clmmJsonInfos
  const [clmmInfos] = useShuck(s_clmmInfos)
  createEffect(() => {
    const infos = clmmInfos()
    if (infos) {
      const key = Object.keys(infos)[0]
      console.log('🧪🧪 first clmmJson: ', { ...infos[key] })
    }
  })
  const t = useToken()
  return (
    <DatabaseTableWidget
      title='Clmms List'
      items={clmmInfos}
      getKey={(i) => i.id}
      tabelCellConfigs={[
        {
          name: 'pool-name',
          contentExistIn: 'face',
          get: (i) => <Row>{getToken(i.base)?.symbol}</Row>,
        },
        {
          name: 'liquidity',
          contentExistIn: 'face',
          get: (i) => <>Liquidity</>,
        },
      ]}
      TopMiddle={<ClmmPageTabBlock />}
      TopRight={<ClmmPageActionHandlersBlock />}
    />
  )
}

function ClmmPageTabBlock(props: { className?: string }) {
  return (
    <Tabs>
      <TabList icss={{ display: 'flex', '> *': { marginInline: '8px' } }}>
        <Loop of={allClmmTabs}>{(clmmTab) => <Tab>{clmmTab}</Tab>}</Loop>
      </TabList>
    </Tabs>
  )
}

function ClmmPageActionHandlersBlock(props: { className?: string }) {
  return <Text>actions</Text>
}
