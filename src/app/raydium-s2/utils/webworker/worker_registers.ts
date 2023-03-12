import { registInWorker as pairRegist } from '../../stores/pairs/workerRegister'
import { registInWorker as tokenRegist } from '../../stores/tokenList/workerRegister'
import { registInWorker as tokenPriceRegist } from '../../stores/tokenPrice/workerRegister'
import { registInWorker as farmRegist } from '../../stores/farms/workerRegister'

export function applyWebworkerRegisters() {
  tokenRegist()
  tokenPriceRegist()
  pairRegist()
  farmRegist()
}
