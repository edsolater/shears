import { isObject, isUndefined } from "@edsolater/fnkit"
import { Box, InfiniteScrollList, Text, cssColors } from "@edsolater/pivkit"
import {
  shuck_balances,
  shuck_clmmInfos,
  shuck_isClmmJsonInfoLoading,
  shuck_isMobile,
  shuck_isTokenAccountsLoading,
  shuck_isTokenListLoading,
  shuck_isTokenListLoadingError,
  shuck_isTokenPricesLoading,
  shuck_owner,
  shuck_rpc,
  shuck_slippage,
  shuck_tokenAccounts,
  shuck_tokenPrices,
  shuck_tokens,
  shuck_walletAdapter,
  shuck_walletConnected,
} from "../stores/data/store"
import { useShuckValue } from "../../packages/conveyor/solidjsAdapter/useShuck"

/**
 *
 * COMPONENT
 * show current page valiable shortcut
 */
export function ShuckInspectorPanel() {
  const isTokenPricesLoading = useShuckValue(shuck_isTokenPricesLoading)
  const tokenPrices = useShuckValue(shuck_tokenPrices)
  const isTokenListLoading = useShuckValue(shuck_isTokenListLoading)
  const isTokenListLoadingError = useShuckValue(shuck_isTokenListLoadingError)
  const tokens = useShuckValue(shuck_tokens)
  const isTokenAccountsLoading = useShuckValue(shuck_isTokenAccountsLoading)
  const tokenAccounts = useShuckValue(shuck_tokenAccounts)
  const balances = useShuckValue(shuck_balances)
  const walletAdapter = useShuckValue(shuck_walletAdapter)
  const walletConnected = useShuckValue(shuck_walletConnected)
  const owner = useShuckValue(shuck_owner)
  const rpc = useShuckValue(shuck_rpc)
  const isMobile = useShuckValue(shuck_isMobile)
  const slippage = useShuckValue(shuck_slippage)
  const isClmmJsonInfoLoading = useShuckValue(shuck_isClmmJsonInfoLoading)
  const clmmInfos = useShuckValue(shuck_clmmInfos)

  const allShucks = {
    isTokenPricesLoading,
    tokenPrices,
    isTokenListLoading,
    isTokenListLoadingError,
    tokens,
    isTokenAccountsLoading,
    tokenAccounts,
    balances,
    walletAdapter,
    walletConnected,
    owner,
    rpc,
    isMobile,
    slippage,
    isClmmJsonInfoLoading,
    clmmInfos,
  }
  return (
    <Box
      class={"keyboard-shortcut-panel"}
      icss={{
        //TODO: should be on by keyboard , temporary just hidden it!!
        visibility: "hidden", // may cost performance
        pointerEvents: "none",
        position: "fixed",
        bottom: "50vh",
        right: 0,
        border: "solid",
        padding: "4px",
        zIndex: 10,
        contain: "content",
        backdropFilter: "blur(2px) brightness(0.2)",
      }}
    >
      <InfiniteScrollList items={allShucks}>
        {(value, name) => (
          <Box icss={{ display: "grid", gridTemplateColumns: "180px 200px", gap: "8px" }}>
            <Text icss={cssColors.labelColor}>{name}</Text>
            <Text>
              {isObject(value()) ? Object.keys(value()!).length : isUndefined(value()) ? null : String(value())}
            </Text>
          </Box>
        )}
      </InfiniteScrollList>
    </Box>
  )
}
