import { registInWorker as pairRegist } from '../../atoms/pairs/workerRegister'
import { registInWorker as tokenRegist } from '../../atoms/tokenList/workerRegister'
import { registInWorker as tokenPriceRegist } from '../../atoms/tokenPrice/workerRegister'
import { registInWorker as farmRegist } from '../../atoms/farmJson/workerRegister'

export function applyWebworkerRegisters() {
  tokenRegist()
  tokenPriceRegist()
  pairRegist()
  farmRegist()
}
