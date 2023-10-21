import { loadFarmJsonInfos_worker } from '../../stores/data/portActions/loadFarmJsonInfos_worker'
import { loadFarmSYNInfos_worker } from '../../stores/data/portActions/loadFarmSYNInfos_worker'
import { loadPairs_worker } from '../../stores/data/portActions/loadPairs_worker'
import { loadTokenPrice_worker } from '../../stores/data/portActions/loadTokenPrice_worker'
import { loadTokens_worker } from '../../stores/data/portActions/loadTokens_worker'
import { calculateSwapRouteInfos_worker } from '../../stores/data/portActions/calculateSwapRouteInfos_worker'
import { txSwap_worker } from '../../stores/data/portActions/txSwap_worker'
import { MessagePortTransformers } from './createMessagePortTransforers'

export function applyWebworkerRegisters(messageTransformers: MessagePortTransformers) {
  console.log('apply webworker registers')
  calculateSwapRouteInfos_worker(messageTransformers)
  txSwap_worker(messageTransformers)
  loadFarmJsonInfos_worker(messageTransformers)
  loadFarmSYNInfos_worker(messageTransformers)
  loadPairs_worker(messageTransformers)
  loadTokens_worker(messageTransformers)
  loadTokenPrice_worker(messageTransformers)
}
