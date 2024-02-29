import { count, isNumberish, toFormattedNumber, type Numberish, type NumberishFormatOptions } from '@edsolater/fnkit'
import { Box, KitProps, Text, useKitProps } from '@edsolater/pivkit'
import { createEffect, onMount } from 'solid-js'
import { useShuck } from '../../packages/conveyor/solidjsAdapter/useShuck'
import { Loop, Row, Tab, TabList, Tabs, parseICSSToClassName } from '../../packages/pivkit'
import {
  DatabaseTable,
  type DatabaseTabelItemCollapseContentRenderConfig,
  type DatabaseTabelItemCollapseFaceRenderConfig,
  type TabelHeaderConfigs,
} from '../components/DatabaseTable'
import { TokenAvatar } from '../components/TokenAvatar'
import { TokenAvatarPair } from '../components/TokenAvatarPair'
import { Token } from '../components/TokenProps'
import { TokenSymbolPair } from '../components/TokenSymbolPair'
import { loadClmmInfos } from '../stores/data/portActions/loadClmmInfos_main'
import { useToken } from '../stores/data/shapeParser/token'
import { allClmmTabs, createStorePropertySignal, shuck_clmmInfos } from '../stores/data/store'
import type { ClmmInfo } from '../stores/data/types/clmm'
import type { PairInfo } from '../stores/data/types/pairs'

export const icssClmmItemRow = parseICSSToClassName({ paddingBlock: '4px' })
export const icssClmmItemRowCollapse = parseICSSToClassName({
  borderRadius: '20px',
  overflow: 'hidden',
})

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
  const headerConfig: TabelHeaderConfigs<ClmmInfo> = [
    {
      name: 'Pool',
    },
    {
      name: 'Liquidity',
    },
    {
      name: 'Volume(24h)',
    },
    {
      name: 'Fees(24h)',
    },
    {
      name: 'Rewards',
    },
  ]
  const itemFaceConfig: DatabaseTabelItemCollapseFaceRenderConfig<ClmmInfo> = [
    {
      name: 'Pool',
      render: (i) => (
        <Row icss={{ alignItems: 'center' }}>
          <TokenAvatarPair token1={i.base} token2={i.quote} />
          <TokenSymbolPair icss={{ fontWeight: 500 }} token1={i.base} token2={i.quote} />
        </Row>
      ),
    },
    {
      name: 'Liquidity',
      render: (i) => <Row>{toRenderable(i.liquidity, { shortExpression: true, decimals: 0 })}</Row>,
    },
    {
      name: 'Volume(24h)',
      render: (i) => <Row>{toRenderable(i.volume?.['24h'], { shortExpression: true, decimals: 0 })}</Row>,
    },
    {
      name: 'Fees(24h)',
      render: (i) => <Row>{toRenderable(i.volumeFee?.['24h'], { shortExpression: true, decimals: 0 })}</Row>,
    },
    {
      name: 'Rewards',
      render: (i) => (
        <Row icss={{ gap: '2px' }}>
          <Loop of={i.rewardInfos}>{(info) => <TokenAvatar token={info.tokenMint} size={'sm'} />}</Loop>
        </Row>
      ),
    },
  ]
  const itemContentConfig: DatabaseTabelItemCollapseContentRenderConfig<ClmmInfo> = {
    render: (i) => (
      <Row icss={{ alignItems: 'center' }}>
        <Loop of={i.userPositionAccounts}>
          {(account) => (
            <Row icss={{ gap: '2px' }}>
              <Box icss={{ border: 'solid', borderRadius: '12px' }}>
                <Text>{toRenderable(account.priceLower)}-{toRenderable(account.priceUpper)}</Text>
              </Box>
            </Row>
          )}
        </Loop>
        <TokenAvatarPair token1={i.base} token2={i.quote} />
        <TokenSymbolPair icss={{ fontWeight: 500 }} token1={i.base} token2={i.quote} />
      </Row>
    ),
  }
  return (
    <DatabaseTable
      title='Concentrated Pools'
      subtitle='Concentrated Pools'
      subtitleDescription='Concentrate liquidity for increased capital efficiency'
      items={clmmInfos}
      getKey={(i) => i.id}
      headerConfig={headerConfig}
      itemFaceConfig={itemFaceConfig}
      itemContentConfig={itemContentConfig}
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

export function toRenderable(v: Numberish, options?: NumberishFormatOptions): string
export function toRenderable(v: Numberish | undefined, options?: NumberishFormatOptions): string | undefined
export function toRenderable(v: any, options?: any): string
export function toRenderable(v: any, options?: any): string | undefined
export function toRenderable(v: any, options?: any): string | undefined {
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
