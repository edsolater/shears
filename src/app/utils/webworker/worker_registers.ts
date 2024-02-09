import { loadFarmJsonInfosInWorker } from '../../stores/data/portActions/loadFarmJsonInfos_worker'
import { loadFarmSYNInfosInWorker } from '../../stores/data/portActions/loadFarmSYNInfos_worker'
import { loadPairsInWorker } from '../../stores/data/portActions/loadPairs_worker'
import { loadTokenPriceInWorker } from '../../stores/data/portActions/loadTokenPrice_worker'
import { loadTokensInWorker } from '../../stores/data/portActions/loadTokens_worker'
import { calculateSwapRouteInfosInWorker } from '../../stores/data/portActions/calculateSwapRouteInfos_worker'
import { txSwapInWorker } from '../../stores/data/portActions/txSwap_worker'
import { MessagePortTransformers } from './createMessagePortTransforers'
import { logMessage } from '../../logger/logMessage'
import { loadClmmInfosInWorker } from '../../stores/data/portActions/loadClmmInfos_worker'

export function applyWebworkerRegisters(messageTransformers: MessagePortTransformers) {
  logMessage({ from: '👾worker', twoWordTitle: 'messge port', detailDescription: 'registered load farm port' })
  calculateSwapRouteInfosInWorker(messageTransformers)
  txSwapInWorker(messageTransformers)
  loadFarmJsonInfosInWorker(messageTransformers)
  loadFarmSYNInfosInWorker(messageTransformers)
  loadPairsInWorker(messageTransformers)
  loadTokensInWorker(messageTransformers)
  loadTokenPriceInWorker(messageTransformers)
  loadClmmInfosInWorker(messageTransformers)
}
