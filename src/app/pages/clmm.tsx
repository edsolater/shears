import { count, runTasks } from "@edsolater/fnkit"
import { Box, Col, Icon, KitProps, Loop, Row, Text, cssOpacity, useKitProps } from "@edsolater/pivkit"
import { Show, createEffect, onCleanup, onMount } from "solid-js"
import { useShuckValue } from "../../packages/conveyor/solidjsAdapter/useShuck"
import { Button, Tab, TabList, Tabs, parseICSSToClassName } from "../../packages/pivkit"
import { ListBox } from "../../packages/pivkit/components/ListBox"
import { CircularProgressBar } from "../components/CircularProgressBar"
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
import { useLoopPercent } from "../hooks/useLoopPercent"
import { loadClmmInfos, refreshClmmInfos } from "../stores/data/clmm/loadClmmInfos_main"
import { useClmmInfo } from "../stores/data/clmm/useClmmInfo"
import { useClmmUserPositionAccount } from "../stores/data/clmm/useClmmUserPositionAccount"
import { allClmmTabs, shuck_clmmInfos } from "../stores/data/store"
import type { ClmmInfo, ClmmUserPositionAccount } from "../stores/data/types/clmm"
import type { PairInfo } from "../stores/data/types/pairs"
import { toRenderable } from "../utils/common/toRenderable"
import toUsdVolume from "../utils/format/toUsdVolume"
import { invokeTxConfig } from "../utils/txHandler/txDispatcher_main"

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
  console.count("[clmm page loaded]")
  onMount(() => {
    const taskManager = loadClmmInfos()
    onCleanup(taskManager.destory)
  })
  const clmmInfos = useShuckValue(shuck_clmmInfos)
  createEffect(() => {
    const infos = clmmInfos()
    if (infos) {
      console.log("clmmJson count: ", count(infos))
    }
  })
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
    {
      name: "Strategy",
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
    {
      name: "Strategy",
      render: (i) => {
        const clmmInfo = useClmmInfo(i)
        return (
          <Row icss={{ gap: "2px" }}>
            <Button
              onClick={async ({ ev }) => {
                ev.stopPropagation()
                const configs = clmmInfo.buildCustomizedFollowPositionTxConfigs({ ignoreWhenUsdLessThan: 27 })
                if (configs) {
                  runTasks(
                    ({ next }) => {
                      if (configs.decreaseClmmPositionTxConfigs.length) {
                        const d = invokeTxConfig(...configs.decreaseClmmPositionTxConfigs)
                        d?.onTxAllDone(({ txids }) => {
                          console.log("success to txAllDone")
                          next()
                        }, {})
                      } else {
                        next()
                      }
                    },
                    () => {
                      console.log("run tx follow 2")
                      if (configs.increaseClmmPositionTxConfigs.length) {
                        invokeTxConfig(...configs.increaseClmmPositionTxConfigs)
                      }
                    },
                  )
                  //   if (!configs.decreaseClmmPositionTxConfigs.length) {
                  //     invokeTxConfig(...configs.increaseClmmPositionTxConfigs)
                  // } else {
                  //     const desTx = invokeTxConfig(...configs.decreaseClmmPositionTxConfigs)
                  //     desTx?.on("txAllDone", () => {
                  //       invokeTxConfig(...configs.increaseClmmPositionTxConfigs)
                  //     })
                  //   }
                }
              }}
              // TODO: not reactive // disabled={!("userPositionAccounts" in clmmInfo) || clmmInfo.userPositionAccounts?.length === 0}
            >
              Apply my strategy
            </Button>
          </Row>
        )
      },
    },
  ]
  const itemContentConfig: DatabaseTabelItemCollapseContentRenderConfig<ClmmInfo> = {
    render: (clmmInfo) => (
      <Col class="collapse-content">
        current price: {toRenderable(clmmInfo.currentPrice, { decimals: 4 })}
        <ListBox
          of={clmmInfo.userPositionAccounts}
          // sortCompareFn={(a, b) => (gt(a.priceLower, b.priceLower) ? 1 : eq(a.priceLower, b.priceLower) ? 0 : -1)}
          Divider={<Box icss={{ borderTop: `solid ${cssOpacity("currentcolor", 0.3)}` }}></Box>}
        >
          {(account) => <ClmmUserPositionAccountRow clmmInfo={clmmInfo} account={account} />}
        </ListBox>
      </Col>
    ),
  }
  const { percent } = useLoopPercent()
  return (
    <DatabaseTable
      title="Concentrated Pools"
      subtitle="Concentrated Pools"
      subtitleDescription="Concentrate liquidity for increased capital efficiency"
      items={clmmInfos}
      getKey={(i) => i.id}
      headerConfig={headerConfig}
      itemRowConfig={{
        collapseTransitionDuration: (clmmInfo) => (clmmInfo.userPositionAccounts?.length ?? 0) * 10 + 150,
      }}
      itemFaceConfig={itemFaceConfig}
      itemContentConfig={itemContentConfig}
      TopMiddle={<ClmmPageTabBlock />}
      TopRight={<ClmmPageActionHandlersBlock />}
      TableBodyTopRight={
        <CircularProgressBar
          percent={percent}
          onClick={() => {
            refreshClmmInfos({ shouldApi: false, shouldSDKCache: false })
          }}
        />
      }
    />
  )
}

/**
 * comopnent render clmm user position account
 * @todo what if it is a collapse box💡💡✨👻
 */
function ClmmUserPositionAccountRow(props: { clmmInfo: ClmmInfo; account: ClmmUserPositionAccount }) {
  const positionAccount = useClmmUserPositionAccount(props.clmmInfo, props.account)
  return (
    <Row
      icss={{
        gap: "16px",
        margin: "8px 32px",
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

      <Row icss={{ gap: "8px" }}>
        <Button>Harvest</Button>
        <Button
          onClick={() => {
            invokeTxConfig(
              positionAccount.buildPositionIncreaseTxConfig({
                amountB: 1, // TODO: should be input
              }),
            )
          }}
        >
          +
        </Button>
        <Button
          onClick={() => {
            invokeTxConfig(
              positionAccount.buildPositionDecreaseTxConfig({
                amountB: 0.1, // TODO: should be input
              }),
            )
          }}
        >
          -
        </Button>
        <Button
          onClick={() => {
            invokeTxConfig(
              positionAccount.buildPositionSetTxConfig({
                usd: 9, // TODO: should be input
              }),
            )
          }}
        >
          Set To
        </Button>
        <Button
          onClick={() => {
            invokeTxConfig(positionAccount.buildPositionShowHandTxConfig())
          }}
        >
          Rush all
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
