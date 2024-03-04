import { add, count, div, mul, toStringNumber, type Numberish } from '@edsolater/fnkit'
import { Box, Col, KitProps, Text, useKitProps } from '@edsolater/pivkit'
import { createEffect, createMemo, onMount, type Accessor } from 'solid-js'
import { createStore, reconcile } from 'solid-js/store'
import { useShuckValue } from '../../packages/conveyor/solidjsAdapter/useShuck'
import { Button, cssOpacity, Loop, parseICSSToClassName, Row, Tab, TabList, Tabs } from '../../packages/pivkit'
import { ListBox } from '../../packages/pivkit/components/ListBox'
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
import { useTokenPrice } from '../stores/data/shapeParser/tokenPrice'
import {
  allClmmTabs,
  createStorePropertySignal,
  shuck_clmmInfos,
  shuck_tokenPrices,
  shuck_tokens,
} from '../stores/data/store'
import type { ClmmInfo, ClmmUserPositionAccount } from '../stores/data/types/clmm'
import type { PairInfo } from '../stores/data/types/pairs'
import { toRenderable } from '../utils/common/toRenderable'
import type { Price, USDVolume } from '../utils/dataStructures/type'
import toUsdVolume from '../utils/format/toUsdVolume'

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
  const clmmInfos = useShuckValue(shuck_clmmInfos)
  createEffect(() => {
    const infos = clmmInfos()
    if (infos) {
      const key = Object.keys(infos)[0]
      console.log('🧪🧪 first clmmJson: ', { ...infos[key] })
      console.log('clmmJson count: ', count(infos))
    }
  })
  const tokenPrices = useShuckValue(shuck_tokenPrices)
  const tokens = useShuckValue(shuck_tokens)
  const t = useToken()
  createEffect(() => {
    console.log('🧪🧪 tokenPrices: ', tokenPrices())
    console.log('🧪🧪 tokens: ', tokens())
  })
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
      <Col class='collapse-content'>
        <ListBox
          of={i.userPositionAccounts}
          Divider={<Box icss={{ borderTop: `solid ${cssOpacity('currentcolor', 0.3)}` }}></Box>}
        >
          {(account) => <ClmmUserPositionAccountRow clmmInfo={i} account={account} />}
        </ListBox>
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

/**
 * comopnent render clmm user position account
 */
function ClmmUserPositionAccountRow(props: { clmmInfo: ClmmInfo; account: ClmmUserPositionAccount }) {
  const { rangeText, userLiquidity } = useClmmUserPositionAccount(props.clmmInfo, props.account)
  return (
    <Row icss={{ gap: '20px', margin: '8px 32px' }}>
      {/* range */}
      <Box icss={{ borderRadius: '12px' }}>
        <Text>{rangeText()}</Text>
      </Box>

      {/* my liquidity */}
      <Text>{toRenderable(props.account.liquidity, { decimals: 0 })}</Text>

      {/* pending yield */}
      <Text>{toUsdVolume(userLiquidity(), { decimals: 4 })}</Text>

      <Button>Harvest</Button>
      <Button>Increase</Button>
      <Button>Decrease</Button>
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
 * hooks
 * hydrate {@link ClmmUserPositionAccount} to ui used data
 */
function useClmmUserPositionAccount(clmmInfo: ClmmInfo, userPositionAccount: ClmmUserPositionAccount) {
  const tokenA = useToken(() => clmmInfo.base)
  const tokenB = useToken(() => clmmInfo.quote)
  const priceA = useTokenPrice(() => clmmInfo.base)
  const priceB = useTokenPrice(() => clmmInfo.quote)

  const userLiquidity = createMemo(() => {
    const tokenAPrices = priceA()
    const tokenBPrices = priceB()
    if (!tokenAPrices || !tokenBPrices) return undefined
    const tokenADecimal = tokenA.decimals
    const tokenBDecimal = tokenB.decimals
    const amountABN = userPositionAccount.amountBaseBN
    const amountBBN = userPositionAccount.amountQuoteBN
    if (amountABN === undefined || amountBBN === undefined) return undefined
    return getLiquidityVolume(tokenAPrices, tokenBPrices, tokenADecimal, tokenBDecimal, amountABN, amountBBN)
  })

  const rangeText = createMemo(
    () =>
      `${toRenderable(userPositionAccount.priceLower, { decimals: 4 })}-${toRenderable(userPositionAccount.priceUpper, { decimals: 4 })}`,
  )
  return { rangeText, userLiquidity }
}

/**
 * used in {@link useClmmUserPositionAccount}
 */
function getLiquidityVolume(
  tokenAPrices: Price,
  tokenBPrices: Price,
  tokenADecimal: number,
  tokenBDecimal: number,
  amountABN: Numberish,
  amountBBN: Numberish,
): USDVolume {
  const amountA = applyDecimal(amountABN, tokenADecimal)
  const amountB = applyDecimal(amountBBN, tokenBDecimal)
  const wholeLiquidity = add(mul(amountA, tokenAPrices), mul(amountB, tokenBPrices))
  return wholeLiquidity
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

function applyDecimal(n: Numberish, decimal: number): Numberish {
  return div(n, Math.pow(10, decimal)) // TODO: should be faster
}
