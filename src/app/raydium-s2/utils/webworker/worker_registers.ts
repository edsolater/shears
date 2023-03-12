import { registInWorker as pairRegist } from '../../stores/pairs/webworker'
import { registInWorker as tokenRegist } from '../../atoms/tokenListUtils/webworkerRegister'
import { registInWorker as tokenPriceRegist } from '../../atoms/tokenPriceWorkerUtils'
import { registInWorker as farmRegist } from '../../atoms/farmJsonUtils/webworker'

export function applyWebworkerRegisters() {
  tokenRegist()
  tokenPriceRegist()
  pairRegist()
  farmRegist()
}
