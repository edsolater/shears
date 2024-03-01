import { count } from '@edsolater/fnkit'
import { Box, Col, KitProps, Text, useKitProps } from '@edsolater/pivkit'
import { createEffect, onMount, type Accessor, createMemo } from 'solid-js'
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
import type { ClmmInfo, ClmmUserPositionAccount } from '../stores/data/types/clmm'
import type { PairInfo } from '../stores/data/types/pairs'
import { toRenderable } from '../utils/common/toRenderable'
import { createStore, reconcile } from 'solid-js/store'

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
      <Col icss={{ alignItems: 'center' }}>
        <Loop of={i.userPositionAccounts}>{(account) => <ClmmUserPositionAccountRow account={account} />}</Loop>
      </Col>
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

function ClmmUserPositionAccountRow(props: { account: ClmmUserPositionAccount }) {
  const { rangeText } = useClmmUserPositionAccount(() => props.account)
  return (
    <Row icss={{ gap: '2px' }}>
      <Box icss={{ borderRadius: '12px' }}>
        <Text>{rangeText()}</Text>
      </Box>
    </Row>
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

/**
 * hydrate {@link ClmmUserPositionAccount} to ui used data
 */
function useClmmUserPositionAccount(account: Accessor<ClmmUserPositionAccount>) {
  const userPositionAccount = createStoreFromAccessor(account)
  const rangeText = createMemo(
    () =>
      `${toRenderable(userPositionAccount.priceLower, { decimals: 4 })}-${toRenderable(userPositionAccount.priceUpper, { decimals: 4 })}`,
  )
  return { rangeText }
}

// 🔥 already in pivkit
/** T must is object */
function createStoreFromAccessor<T extends object>(
  signal: Accessor<T>,
  options?: {
    key: string
  },
) {
  const [store, setStore] = createStore(signal())
  createEffect(() => {
    setStore(reconcile(signal(), { key: options?.key }))
  })
  return store
}
