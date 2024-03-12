import { assert, count, div, eq, gt, type Numberish } from "@edsolater/fnkit"
import { Box, Col, cssOpacity, Icon, KitProps, Loop, Row, Text, useKitProps } from "@edsolater/pivkit"
import { createEffect, onMount, Show, type Accessor } from "solid-js"
import { createStore, reconcile } from "solid-js/store"
import { useShuckValue } from "../../packages/conveyor/solidjsAdapter/useShuck"
import { Button, parseICSSToClassName, Tab, TabList, Tabs } from "../../packages/pivkit"
import { ListBox } from "../../packages/pivkit/components/ListBox"
import {
  DatabaseTable,
  type DatabaseTabelItemCollapseContentRenderConfig,
  type DatabaseTabelItemCollapseFaceRenderConfig,
  type TabelHeaderConfigs,
} from "../components/DatabaseTable"
import { TokenAvatar } from "../components/TokenAvatar"
import { TokenAvatarPair } from "../components/TokenAvatarPair"
import { Token } from "../components/TokenProps"
import { TokenSymbolPair } from "../components/TokenSymbolPair"
import { useClmmUserPositionAccount } from "../stores/data/featureHooks/useClmmUserPositionAccount"
import { loadClmmInfos } from "../stores/data/portActions/loadClmmInfos_main"
import {
  allClmmTabs,
  createStorePropertySignal,
  shuck_clmmInfos,
  shuck_rpc,
  shuck_tokenPrices,
  shuck_tokens,
} from "../stores/data/store"
import type { ClmmInfo, ClmmUserPositionAccount } from "../stores/data/types/clmm"
import type { PairInfo } from "../stores/data/types/pairs"
import { useWalletOwner } from "../stores/wallet/store"
import { toRenderable } from "../utils/common/toRenderable"
import toUsdVolume from "../utils/format/toUsdVolume"
import { txDispatcher } from "../utils/txHandler/txDispatcher_main"

export const icssClmmItemRow = parseICSSToClassName({ paddingBlock: "4px" })
export const icssClmmItemRowCollapse = parseICSSToClassName({
  borderRadius: "20px",
  overflow: "hidden",
})

export function ClmmItemFaceDetailInfoBoard(kitProps: KitProps<{ name: string; value?: any }>) {
  const { props, shadowProps } = useKitProps(kitProps, { name: "ClmmItemFaceDetailInfoBoard" })
  return <Text shadowProps={shadowProps}>{props.value || "--"}</Text>
}

export function ClmmItemFaceTokenAvatarLabel(kitProps: KitProps<{ info?: PairInfo }>) {
  const { props, shadowProps } = useKitProps(kitProps, { name: "ClmmItemFaceTokenAvatarLabel" })
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
      console.log("🧪🧪 first clmmJson: ", { ...infos[key] })
      console.log("clmmJson count: ", count(infos))
    }
  })
  const tokenPrices = useShuckValue(shuck_tokenPrices)
  const tokens = useShuckValue(shuck_tokens)
  const headerConfig: TabelHeaderConfigs<ClmmInfo> = [
    {
      name: "Pool",
    },
    {
      name: "Liquidity",
    },
    {
      name: "Volume(24h)",
    },
    {
      name: "Fees(24h)",
    },
    {
      name: "Rewards",
    },
  ]
  const itemFaceConfig: DatabaseTabelItemCollapseFaceRenderConfig<ClmmInfo> = [
    {
      name: "Pool",
      render: (i) => (
        <Row icss={{ alignItems: "center" }}>
          <TokenAvatarPair token1={i.base} token2={i.quote} />
          <TokenSymbolPair icss={{ fontWeight: 500 }} token1={i.base} token2={i.quote} />
        </Row>
      ),
    },
    {
      name: "Liquidity",
      render: (i) => <Row>{toRenderable(i.liquidity, { shortExpression: true, decimals: 0 })}</Row>,
    },
    {
      name: "Volume(24h)",
      render: (i) => <Row>{toRenderable(i.volume?.["24h"], { shortExpression: true, decimals: 0 })}</Row>,
    },
    {
      name: "Fees(24h)",
      render: (i) => <Row>{toRenderable(i.volumeFee?.["24h"], { shortExpression: true, decimals: 0 })}</Row>,
    },
    {
      name: "Rewards",
      render: (i) => (
        <Row icss={{ gap: "2px" }}>
          <Loop of={i.rewardInfos}>{(info) => <TokenAvatar token={info.tokenMint} size={"sm"} />}</Loop>
        </Row>
      ),
    },
  ]
  const itemContentConfig: DatabaseTabelItemCollapseContentRenderConfig<ClmmInfo> = {
    render: (clmmInfo) => (
      <Col class="collapse-content">
        current price: {toRenderable(clmmInfo.currentPrice, { decimals: 4 })}
        <ListBox
          of={clmmInfo.userPositionAccounts}
          // TODO: should be sortBy to more readable
          sortCompareFn={(a, b) => (gt(a.priceLower, b.priceLower) ? 1 : eq(a.priceLower, b.priceLower) ? 0 : -1)}
          Divider={<Box icss={{ borderTop: `solid ${cssOpacity("currentcolor", 0.3)}` }}></Box>}
        >
          {(account) => <ClmmUserPositionAccountRow clmmInfo={clmmInfo} account={account} />}
        </ListBox>
      </Col>
    ),
  }
  return (
    <DatabaseTable
      title="Concentrated Pools"
      subtitle="Concentrated Pools"
      subtitleDescription="Concentrate liquidity for increased capital efficiency"
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
  const positionAccount = useClmmUserPositionAccount(props.clmmInfo, props.account)
  const rpcUrlS = useShuckValue(shuck_rpc, (r) => r?.url)
  const ownerS = useWalletOwner()
  return (
    <Row
      icss={{
        display: "grid",
        gridAutoFlow: "column",
        gridAutoColumns: "1fr",
        gap: "20px",
        margin: "8px 32px",
        paddingInline: "40px",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      {/* range */}
      <Row icss={{ alignItems: "center", gap: ".5em" }}>
        <Box
          icss={{ alignSelf: "stretch", width: ".2em", background: positionAccount.inRange ? "#39D0D8" : undefined }}
        ></Box>
        <Text>{positionAccount.rangeName}</Text>
        <Row
          icss={{
            fontSize: "small",
            gap: ".25em",
            alignItems: "center",
            color: positionAccount.inRange ? "#39D0D8" : "#DA2EEF",
            background: cssOpacity("currentcolor", 0.15),
            borderRadius: "4px",
            padding: "2px 4px",
          }}
        >
          <Show when={positionAccount.inRange}>
            <Icon icss={{ width: "1em", height: "1em" }} name="in-range" src="/icons/check-circle.svg" />
            <Text>In Range</Text>
          </Show>
          <Show when={!positionAccount.inRange}>
            <Icon
              icss={{ width: "1em", height: "1em", filter: "brightness(1.4)" }}
              name="out-of-range"
              src="/icons/warn-stick.svg"
            />
            <Text icss={{ filter: "brightness(1.4)" }}>Range out</Text>
          </Show>
        </Row>
      </Row>

      {/* my liquidity */}
      <Text icss={{ textAlign: "end" }}>{toUsdVolume(positionAccount.userLiquidityUSD)}</Text>

      {/* pending yield */}
      <Text icss={{ textAlign: "end" }}>{toUsdVolume(positionAccount.pendingRewardAmountUSD)}</Text>

      <Row icss={{ gap: "10%" }}>
        {/* <Button icss={icssFrostedGlass}>Harvest</Button>
        <Button icss={icssFrostedGlass}> + </Button> */}
        <Button
          // icss={icssFrostedGlass}
          onClick={() => {
            const rpcUrl = rpcUrlS()
            assert(rpcUrl, "for clmm position increase, rpc url not ready")

            const owner = ownerS()
            assert(owner, "for clmm position increase, owner not ready")

            txDispatcher("clmm position increase", {
              clmmId: props.clmmInfo.id,
              positionNftMint: props.account.nftMint,
              rpcUrl: rpcUrl,
              amount: 100000, // TODO: should be input
              amountSide: "B", // TODO: should be input
              owner: owner,
              slippage: 0.1, // TODO: should be input
            })
          }}
        >
          {" "}
          -{" "}
        </Button>
      </Row>
    </Row>
  )
}

function ClmmPageTabBlock(props: { className?: string }) {
  return (
    <Tabs>
      <TabList icss={{ "& > *": { marginInline: "8px" } }}>
        <Loop of={allClmmTabs}>{(clmmTab) => <Tab>{clmmTab}</Tab>}</Loop>
      </TabList>
    </Tabs>
  )
}

function ClmmPageActionHandlersBlock(props: { className?: string }) {
  return <Text>actions</Text>
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

export function applyDecimal(n: Numberish, decimal: number): Numberish {
  return div(n, Math.pow(10, decimal)) // TODO: should be faster
}
