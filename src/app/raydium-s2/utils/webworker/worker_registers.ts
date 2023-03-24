import { registInWorker as tokenRegist } from '../../stores/tokenList/workerRegister'
import { registInWorker as tokenPriceRegist } from '../../stores/tokenPrice/workerRegister'
import { registInWorker as dataRegist } from '../../stores/data/workerRegister'

export function applyWebworkerRegisters() {
  tokenRegist()
  tokenPriceRegist()
  dataRegist()
}
