import { loadFarmJsonInfos_worker } from '../../stores/data/portActions/loadFarmJsonInfos_worker'
import { loadFarmSYNInfos_worker } from '../../stores/data/portActions/loadFarmSYNInfos_worker'
import { loadPairs_worker } from '../../stores/data/portActions/loadPairs_worker'
import { loadTokenPrice_worker } from '../../stores/data/portActions/loadTokenPrice_worker'
import { loadTokens_worker } from '../../stores/data/portActions/loadTokens_worker'
import { calculateSwapRouteInfos_worker } from '../../stores/data/portActions/calculateSwapRouteInfos_worker'
import { txSwap_worker } from '../../stores/data/portActions/txSwap_worker'
import { MessagePortTransformers } from './createMessagePortTransforers'
import { logMessage } from '../../logger/logMessage'

export function applyWebworkerRegisters(messageTransformers: MessagePortTransformers) {
  logMessage({ from: '👾worker', twoWordTitle: 'messge port', detailDescription: 'registered load farm port' })
  calculateSwapRouteInfos_worker(messageTransformers)
  txSwap_worker(messageTransformers)
  loadFarmJsonInfos_worker(messageTransformers)
  loadFarmSYNInfos_worker(messageTransformers)
  loadPairs_worker(messageTransformers)
  loadTokens_worker(messageTransformers)
  loadTokenPrice_worker(messageTransformers)
}
