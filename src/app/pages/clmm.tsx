import { count, isNumberish, toFormattedNumber, type Numberish, type NumberishFormatOptions } from '@edsolater/fnkit'
import { Box, KitProps, Text, useKitProps } from '@edsolater/pivkit'
import { createEffect, onMount } from 'solid-js'
import { useShuck } from '../../packages/conveyor/solidjsAdapter/useShuck'
import { CollapseBox, Loop, Row, Tab, TabList, Tabs } from '../../packages/pivkit'
import {
  DatabaseTableItemCollapseContent,
  DatabaseTableItemCollapseFace,
  DatabaseTableList,
  type TabelCellConfigs,
} from '../components/DatabaseTableWidget'
import { TokenAvatar } from '../components/TokenAvatar'
import { TokenAvatarPair } from '../components/TokenAvatarPair'
import { Token } from '../components/TokenProps'
import { TokenSymbolPair } from '../components/TokenSymbolPair'
import { useToken } from '../stores/data/dataHooks/useToken'
import { loadClmmInfos } from '../stores/data/portActions/loadClmmInfos_main'
import { allClmmTabs, createStorePropertySignal, shuck_clmmInfos } from '../stores/data/store'
import type { ClmmInfo } from '../stores/data/types/clmm'
import type { PairInfo } from '../stores/data/types/pairs'

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
  onMount(() => {
    loadClmmInfos()
  })
  const clmmJsonInfos = createStorePropertySignal((s) => s.clmmJsonInfos) // start to load clmmJsonInfos
  const [clmmInfos] = useShuck(shuck_clmmInfos)
  createEffect(() => {
    const infos = clmmInfos()
    if (infos) {
      const key = Object.keys(infos)[0]
      console.log('🧪🧪 first clmmJson: ', { ...infos[key] })
      console.log('clmmJson count: ', count(infos))
    }
  })
  const t = useToken()
  const tabelCellConfigs: TabelCellConfigs<ClmmInfo> = [
    {
      name: 'Pool',
      in: 'face',
      get: (i) => (
        <Row icss={{ alignItems: 'center' }}>
          <TokenAvatarPair token1={i.base} token2={i.quote} />
          <TokenSymbolPair icss={{ fontWeight: 500 }} token1={i.base} token2={i.quote} />
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
  ]
  return (
    <DatabaseTableList
      title='Concentrated Pools'
      subtitle='Concentrated Pools'
      subtitleDescription='Concentrate liquidity for increased capital efficiency'
      items={clmmInfos}
      renderItem={(item) => (
        <Box icss={{ paddingBlock: '4px' }}>
          <CollapseBox
            icss={{
              borderRadius: '20px',
              overflow: 'hidden',
            }}
            // need to render multiple times to get the correct height, why not let it be a web component?
            renderFace={<DatabaseTableItemCollapseFace key={item.id} item={item} tabelItemRowConfig={tabelCellConfigs} />}
            renderContent={<DatabaseTableItemCollapseContent item={item} tabelItemRowConfig={tabelCellConfigs} />}
          />
        </Box>
      )}
      getKey={(i) => i.id}
      tabelItemRowConfig={tabelCellConfigs}
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
    try {
      return toFormattedNumber(v, options)
    } catch (error) {
      console.log(error)
      console.log('input: ', v)
      return ''
    }
  }
  // if (
  //   isString(v) ||
  //   (isNumber(v) && !isNaN(v)) ||
  //   isBigInt(v) ||
  //   (isObject(v) && ('valueOf' in v || 'toString' in v || Symbol.toPrimitive in v))
  // )
  return String(v)
}
