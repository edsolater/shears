import { registInWorker as pairRegist } from '../../stores/pairs/webworker'
import { registInWorker as tokenRegist } from '../../atoms/tokenListUtils/webworkerRegister'
import { registInWorker as tokenPriceRegist } from '../../atoms/tokenPriceWorkerUtils'
import { registInWorker as farmRegist } from '../../stores/farms/webworker'

export function applyWebworkerRegisters() {
  tokenRegist()
  tokenPriceRegist()
  pairRegist()
  farmRegist()
}
