import { count, hasProperty, runTasks, toFormattedNumber } from "@edsolater/fnkit"
import {
  Box,
  Button,
  Col,
  Icon,
  KitProps,
  Loop,
  Row,
  Tab,
  TabList,
  Tabs,
  Text,
  createDomRef,
  createIncreasingSeed,
  createPlugin,
  cssOpacity,
  icssCenter,
  icssGrid,
  listenDomEvent,
  parseICSSToClassName,
  useKitProps,
} from "@edsolater/pivkit"
import { Show, createEffect, createMemo, createSignal, onCleanup, onMount } from "solid-js"
import { useShuck, useShuckAsStore } from "../../packages/conveyor/solidjsAdapter/useShuck"
import {
  DatabaseTable,
  type DatabaseTabelItemCollapseContentRenderConfig,
  type DatabaseTabelItemCollapseFaceRenderConfig,
  type TabelHeaderConfigs,
} from "../components/DatabaseTable"
import { RefreshCircle } from "../components/RefreshCircle"
import { TokenAvatar } from "../components/TokenAvatar"
import { TokenAvatarPair } from "../components/TokenAvatarPair"
import { Token } from "../components/TokenProps"
import { TokenSymbolPair } from "../components/TokenSymbolPair"
import { useLoopTask } from "../hooks/usePercentLoop"
import { loadClmmInfos, refreshClmmInfos } from "../stores/data/clmm/loadClmmInfos_main"
import { calcTotalClmmLiquidityUSD, useClmmInfo } from "../stores/data/clmm/useClmmInfo"
import { useClmmUserPositionAccount } from "../stores/data/clmm/useClmmUserPositionAccount"
import { allClmmTabs, shuck_clmmInfos, shuck_tokenPrices, shuck_tokens } from "../stores/data/store"
import { refreshTokenAccounts } from "../stores/data/tokenAccount&balance/loadOwnerTokenAccounts_main"
import { onBalanceChange } from "../stores/data/tokenAccount&balance/onBalanceChange"
import type { ClmmInfo, ClmmUserPositionAccount } from "../stores/data/types/clmm"
import type { PairInfo } from "../stores/data/types/pairs"
import { reportLog } from "../stores/data/utils/logger"
import { colors } from "../theme/colors"
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
  const [clmmInfos] = useShuckAsStore(shuck_clmmInfos, {})

  createEffect(() => {
    const infos = clmmInfos
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
          <Loop items={i.rewardInfos}>{(info) => <TokenAvatar token={info.tokenMint} size={"sm"} />}</Loop>
        </Row>
      ),
    },
    {
      name: "Strategy",
      render: (rawClmmInfo) => {
        const clmmInfo = useClmmInfo(rawClmmInfo)
        const increasingSeed = createIncreasingSeed()

        // refresh clmm info every 10 mins
        const {
          startLoop,
          stopLoop,
          isRunning: isRefreshLoopRunning,
          invokeOnce: forceRefeshThisClmmInfo,
          lastInvokeTime,
        } = useLoopTask({
          cb: () => {
            console.log("[main] start refresh clmmInfo: ", clmmInfo.id)
            return refreshClmmInfos({ onlyClmmId: [clmmInfo.id], shouldSDKCache: false })
          },
          delay: 1000 * 60 * 12,
          immediate: false,
        })

        // apply strategy every 10 mins
        function runTxFollowPosition() {
          const configs = clmmInfo.buildTxFollowPositionTxConfigs({ ignoreWhenUsdLessThan: 5 })
          console.log("🐛debug tx follow: ", configs)
          if (configs) {
            runTasks(
              ({ next }) => {
                if (configs.upDecreaseClmmPositionTxConfigs.length) {
                  reportLog("[🤖main] 1️⃣ run tx follow step 1")
                  const txEventCenter = invokeTxConfig(...configs.upDecreaseClmmPositionTxConfigs)
                  if (configs.upShowHandTxConfigs.length) {
                    txEventCenter?.onTxAllDone(() => {
                      onBalanceChange(
                        clmmInfo.base,
                        ({ balance }) => {
                          // console.log("balance1️⃣: ", toFormattedNumber(balance, { decimals: 6 }))
                          setTimeout(() => {
                            // wait for balance update
                            const newConfigs = clmmInfo.buildTxFollowPositionTxConfigs({ ignoreWhenUsdLessThan: 5 })
                            const txc = invokeTxConfig(...newConfigs.upShowHandTxConfigs)
                            txc?.onTxAllDone(() => {
                              setTimeout(() => {
                                forceRefeshThisClmmInfo()
                              }, 3000)
                            })
                          }, 1000)
                        },
                        { once: true },
                      )
                    })
                  }
                } else {
                  if (configs.upShowHandTxConfigs.length) {
                    const txc = invokeTxConfig(...configs.upShowHandTxConfigs)
                    txc?.onTxAllDone(() => {
                      setTimeout(() => {
                        forceRefeshThisClmmInfo()
                      }, 3000)
                    })
                  }
                }
                next()
              },
              ({ next }) => {
                if (configs.downDecreaseClmmPositionTxConfigs.length) {
                  reportLog("[🤖main] 2️⃣ run tx follow step 2")
                  const txEventCenter = invokeTxConfig(...configs.downDecreaseClmmPositionTxConfigs)
                  if (configs.downShowHandTxConfigs.length) {
                    txEventCenter?.onTxAllDone(() => {
                      onBalanceChange(
                        clmmInfo.quote,
                        ({ balance }) => {
                          // console.log("balance2️⃣: ", toFormattedNumber(balance, { decimals: 6 }))
                          setTimeout(() => {
                            // wait for balance update
                            const newConfigs = clmmInfo.buildTxFollowPositionTxConfigs({ ignoreWhenUsdLessThan: 5 })
                            const txc = invokeTxConfig(...configs.downShowHandTxConfigs)
                            txc?.onTxAllDone(() => {
                              setTimeout(() => {
                                forceRefeshThisClmmInfo()
                              }, 3000)
                            })
                          }, 1000)
                        },
                        { once: true },
                      )
                    })
                  }
                } else {
                  if (configs.downShowHandTxConfigs.length) {
                    const txc = invokeTxConfig(...configs.downShowHandTxConfigs)
                    txc?.onTxAllDone(() => {
                      setTimeout(() => {
                        forceRefeshThisClmmInfo()
                      }, 8000)
                    })
                  }
                }
              },
            )
          }
          return configs.nextTaskSpeed
        }

        // looply apply strategy

        const [speedLevel, setSpeedLevel] = createSignal<"flash" | "quick" | "normal">("normal")

        const {
          startLoop: startTxFellowLoop,
          stopLoop: stopTxFellowLoop,
          isRunning: isTxFellowLoopRuning,
          invokeOnce: forceInvokeTxFellowLoop,
        } = useLoopTask({
          cb: () => {
            console.log("[main] start tx follow : ", clmmInfo.id)
            forceRefeshThisClmmInfo()?.then(() => {
              const nextTaskSpeedLevel = runTxFollowPosition()
              console.log("nextTaskSpeedLevel: ", nextTaskSpeedLevel)
              setSpeedLevel(nextTaskSpeedLevel)
            })
          },
          delay: () => {
            const speed = speedLevel()
            if (speed === "flash") {
              return 1000 * 20
            } else if (speed === "quick") {
              return 1000 * 60
            } else {
              return 1000 * 60 * 5
            }
          },
          immediate: false,
        })

        // start usdc-usdt
        if (clmmInfo.id === "BZtgQEyS6eXUXicYPHecYQ7PybqodXQMvkjUbP4R8mUU") {
          onMount(startTxFellowLoop)
        }

        return (
          <Row icss={{ gap: "8px" }}>
            <Button
              onClick={({ ev }) => {
                ev.stopPropagation()
                forceInvokeTxFellowLoop()
              }}
              // not strightforward
              plugin={eventPlugin.config({
                onMiddleMouseClick: () => (isTxFellowLoopRuning() ? stopTxFellowLoop() : startTxFellowLoop()),
              })}
              // TODO: not reactive // disabled={!("userPositionAccounts" in clmmInfo) || clmmInfo.userPositionAccounts?.length === 0}
              icss={{ outline: isTxFellowLoopRuning() ? `solid ${colors.primary}` : `solid transparent` }}
            >
              Apply strategy
            </Button>
            <Button
              onClick={({ ev }) => {
                ev.stopPropagation()
                forceRefeshThisClmmInfo()
              }}
              icss={{ outline: isRefreshLoopRunning() ? `solid ${colors.primary}` : `solid transparent` }}
            >
              Refresh
            </Button>
          </Row>
        )
      },
    },
  ]
  const itemContentConfig: DatabaseTabelItemCollapseContentRenderConfig<ClmmInfo> = {
    render: (clmmInfo) => {
      const [prices] = useShuck(shuck_tokenPrices)
      const [tokens] = useShuck(shuck_tokens)
      const total = createMemo(
        () => calcTotalClmmLiquidityUSD({ clmmInfo, prices: prices(), tokens: tokens() }).totalLiquidityUSD,
      )
      return (
        <Col class="collapse-content">
          <Box
            icss={[
              {
                margin: "8px 16px",
                padding: "8px 16px",
                borderRadius: "8px",
                background: cssOpacity(colors.primary, 0.3),
                "> *": {
                  padding: "4px 8px",
                },
              },
              icssGrid.config({
                slot: 2,
                gap: "32px",
                dividerWidth: "1px",
                dividerPadding: "2px",
                dividerBackground: cssOpacity(colors.primary, 0.3),
                dir: "x",
              }),
            ]}
          >
            <Box icss={icssCenter}>current price: {toRenderable(clmmInfo.currentPrice, { decimals: 8 })}</Box>
            <Box icss={icssCenter}>total staked USD: {toRenderable(total(), { decimals: 8 })}</Box>
          </Box>
          <Loop
            items={clmmInfo.userPositionAccounts}
            // sortCompareFn={(a, b) => (gt(a.priceLower, b.priceLower) ? 1 : eq(a.priceLower, b.priceLower) ? 0 : -1)}
            Divider={<Box icss={{ borderTop: `solid ${cssOpacity("currentcolor", 0.3)}` }}></Box>}
          >
            {(account) => <ClmmUserPositionAccountRow clmmInfo={clmmInfo} account={account} />}
          </Loop>
        </Col>
      )
    },
  }

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
        <RefreshCircle
          onClick={() => {
            refreshTokenAccounts({ canUseCache: false })
          }}
          duration={1000 * 60 * 10}
        />
      }
      onClickItem={(clmmInfo) => {
        console.log(`click clmm item: ${clmmInfo.id}`)
      }}
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
            const txBus = invokeTxConfig(
              positionAccount.buildPositionIncreaseTxConfig({
                amountA: 0.1, // TODO: should be input() // this is main for test on Balance change
              }),
            )
            txBus?.onTxSendSuccess(() => {
              if (positionAccount.tokenBase) {
                onBalanceChange(
                  positionAccount.tokenBase,
                  ({ balance }) => {
                    console.log("[main] balance change: ", toFormattedNumber(balance, { decimals: 6 }))
                  },
                  { once: true },
                )
              }
            })
          }}
        >
          +
        </Button>
        <Button
          onClick={() => {
            invokeTxConfig(
              positionAccount.buildPositionDecreaseTxConfig({
                amountB: 0.1, // TODO: should be input // IT!! is B
              }),
            )?.onTxSendSuccess(() => {
              if (positionAccount.tokenQuote) {
                onBalanceChange(
                  positionAccount.tokenQuote,
                  ({ balance }) => {
                    console.log("[main] balance change22: ", toFormattedNumber(balance, { decimals: 6 }))
                  },
                  { once: true },
                )
              }
            })
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
          Set
        </Button>
        <Button
          onClick={() => {
            const txEventCenter = invokeTxConfig(positionAccount.buildPositionShowHandTxConfig())

            txEventCenter?.onTxAllDone(() => {
              setTimeout(() => {
                refreshClmmInfos({
                  onlyClmmId: [props.clmmInfo.id],
                  shouldSDKCache: false,
                })
              }, 2000)
            })
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
        <Loop items={allClmmTabs}>{(clmmTab) => <Tab>{clmmTab}</Tab>}</Loop>
      </TabList>
    </Tabs>
  )
}

function ClmmPageActionHandlersBlock(props: { className?: string }) {
  return <Text>actions</Text>
}

const eventPlugin = createPlugin((options?: { onMiddleMouseClick?: () => void }) => () => {
  const { dom, setDom } = createDomRef()

  if (hasProperty(options, "onMiddleMouseClick")) {
    createEffect(() => {
      const el = dom()
      if (!el) return
      const { cancel } = listenDomEvent(
        el,
        "pointerup",
        ({ ev }) => {
          console.log("ev.button: ", ev.button)
          if (ev.button === 1) {
            options?.onMiddleMouseClick?.()
          }
        },
        { preventDefault: true, stopPropergation: true },
      )
      onCleanup(cancel)
    })
  }

  return { domRef: setDom }
})
