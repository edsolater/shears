import { Box, KitProps, Text, useKitProps } from '@edsolater/pivkit'
import { createEffect } from 'solid-js'
import { useShuck } from '../../packages/conveyor/solidjsAdapter/useShuck'
import { Loop, Row, Tab, TabList, Tabs } from '../../packages/pivkit'
import { DatabaseTableWidget } from '../components/DatabaseTableWidget'
import { Token } from '../components/TokenProps'
import { useToken } from '../stores/data/dataHooks/useToken'
import { allClmmTabs, createStorePropertySignal, s_clmmInfos } from '../stores/data/store'
import type { PairInfo } from '../stores/data/types/pairs'
import { getToken } from '../stores/data/utils/getToken'
import { TokenAvatar } from '../components/TokenAvatar'
import { isString, isNumber, isBigInt, isObject, isNaN } from '@edsolater/fnkit'

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
      title='Concentrated Pools'
      subtitle='Concentrated Pools'
      subtitleDescription='Concentrate liquidity for increased capital efficiency'
      items={clmmInfos}
      getKey={(i) => i.id}
      tabelCellConfigs={[
        {
          name: 'Pool',
          in: 'face',
          get: (i) => (
            <Row>
              {getToken(i.base)?.symbol}-{getToken(i.quote)?.symbol}
            </Row>
          ),
        },
        {
          name: 'Liquidity',
          in: 'face',
          get: (i) => <Row>{toRenderable(i.liquidity)}</Row>,
        },
        {
          name: 'Volume(24h)',
          in: 'face',
          get: (i) => <Row>{toRenderable(i.volume?.['24h'])}</Row>,
        },
        {
          name: 'Fees(24h)',
          in: 'face',
          get: (i) => <Row>{toRenderable(i.volumeFee?.['24h'])}</Row>,
        },
        {
          name: 'Rewards',
          in: 'face',
          get: (i) => (
            <Row>
              <Loop of={i.rewardInfos}>{(info) => <TokenAvatar token={info.tokenMint} />}</Loop>
            </Row>
          ),
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
      <TabList icss={{ '& > *': { marginInline: '8px' } }}>
        <Loop of={allClmmTabs}>{(clmmTab) => <Tab>{clmmTab}</Tab>}</Loop>
      </TabList>
    </Tabs>
  )
}

function ClmmPageActionHandlersBlock(props: { className?: string }) {
  return <Text>actions</Text>
}

function toRenderable(v: any): string | undefined {
  if (v == null) return undefined
  
  // if (
  //   isString(v) ||
  //   (isNumber(v) && !isNaN(v)) ||
  //   isBigInt(v) ||
  //   (isObject(v) && ('valueOf' in v || 'toString' in v || Symbol.toPrimitive in v))
  // )
  return String(v)
}
