import { Numberish, isNumberish } from '@edsolater/fnkit'
import { Box, KitProps, Text, useKitProps } from '@edsolater/pivkit'
import { createEffect } from 'solid-js'
import { useShuck } from '../../packages/conveyor/solidjsAdapter/useShuck'
import { Loop, Row, Tab, TabList, Tabs } from '../../packages/pivkit'
import { DatabaseTableWidget } from '../components/DatabaseTableWidget'
import { TokenAvatar } from '../components/TokenAvatar'
import { TokenAvatarPair } from '../components/TokenAvatarPair'
import { Token } from '../components/TokenProps'
import { TokenSymbolPair } from '../components/TokenSymbolPair'
import { useToken } from '../stores/data/dataHooks/useToken'
import { allClmmTabs, createStorePropertySignal, s_clmmInfos } from '../stores/data/store'
import type { PairInfo } from '../stores/data/types/pairs'
import { NumberishFormatOptions, parseNumberishToString } from '../utils/dataStructures/Numberish'

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
            <Row icss={{ alignItems: 'center' }}>
              <TokenAvatarPair token1={i.base} token2={i.quote} />
              <TokenSymbolPair icss={{ fontWeight:500 }} token1={i.base} token2={i.quote} />
            </Row>
          ),
        },
        {
          name: 'Liquidity',
          in: 'face',
          get: (i) => <Row>{toRenderable(i.liquidity, { shortExpression: true, decimals: 0 })}</Row>,
        },
        {
          name: 'Volume(24h)',
          in: 'face',
          get: (i) => <Row>{toRenderable(i.volume?.['24h'], { shortExpression: true, decimals: 0 })}</Row>,
        },
        {
          name: 'Fees(24h)',
          in: 'face',
          get: (i) => <Row>{toRenderable(i.volumeFee?.['24h'], { shortExpression: true, decimals: 0 })}</Row>,
        },
        {
          name: 'Rewards',
          in: 'face',
          get: (i) => (
            <Row icss={{ gap: '2px' }}>
              <Loop of={i.rewardInfos}>{(info) => <TokenAvatar token={info.tokenMint} size={'sm'} />}</Loop>
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

function toRenderable(v: Numberish, options?: NumberishFormatOptions): string
function toRenderable(v: Numberish | undefined, options?: NumberishFormatOptions): string | undefined
function toRenderable(v: any, options?: any): string
function toRenderable(v: any, options?: any): string | undefined
function toRenderable(v: any, options?: any): string | undefined {
  if (v == null) return undefined
  if (isNumberish(v)) {
    return parseNumberishToString(v, options)
  }
  // if (
  //   isString(v) ||
  //   (isNumber(v) && !isNaN(v)) ||
  //   isBigInt(v) ||
  //   (isObject(v) && ('valueOf' in v || 'toString' in v || Symbol.toPrimitive in v))
  // )
  return String(v)
}
