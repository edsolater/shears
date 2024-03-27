import { loadFarmJsonInfosInWorker } from "../../stores/data/portActions/loadFarmJsonInfos_worker"
import { loadFarmSYNInfosInWorker } from "../../stores/data/portActions/loadFarmSYNInfos_worker"
import { loadPairsInWorker } from "../../stores/data/portActions/loadPairs_worker"
import { loadTokenPriceInWorker } from "../../stores/data/portActions/loadTokenPrice_worker"
import { loadTokensInWorker } from "../../stores/data/portActions/loadTokens_worker"
import { calculateSwapRouteInfosInWorker } from "../../stores/data/portActions/calculateSwapRouteInfos_worker"
import { txDispatcher_worker } from "../txHandler/txDispatcher_worker"
import { PortUtils } from "./createMessagePortTransforers"
import { logMessage } from "../../logger/logMessage"
import { workerLoadClmmInfos } from "../../stores/data/clmm/loadClmmInfos_worker"
import { loadOwnerTokenAccountsInWorker } from "../../stores/data/portActions/loadOwnerTokenAccounts_worker"

export function applyWebworkerRegisters(messageTransformers: PortUtils) {
  logMessage({ from: "👾worker", twoWordTitle: "messge port", detailDescription: "registered load farm port" })
  calculateSwapRouteInfosInWorker(messageTransformers)
  txDispatcher_worker(messageTransformers)
  loadFarmJsonInfosInWorker(messageTransformers)
  loadFarmSYNInfosInWorker(messageTransformers)
  loadPairsInWorker(messageTransformers)
  loadTokensInWorker(messageTransformers)
  loadOwnerTokenAccountsInWorker(messageTransformers)
  loadTokenPriceInWorker(messageTransformers)
  workerLoadClmmInfos(messageTransformers)
}
