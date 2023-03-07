import { PublicKey } from '@solana/web3.js'
import toPubString, { toPub } from '../../../stores/common/utils/pub'
import { addTransportRule } from '../addTransportRule'
import { createEncodedObject } from '../createEncodedObject'
import { EncodedObject } from '../type'

export const rulesAction = () =>
  addTransportRule({
    name: 'PublicKey',
    class: PublicKey,
    encodeFn: (rawData: PublicKey) => createEncodedObject('PublicKey', toPubString(rawData)),
    decodeFn: (encodedData: EncodedObject<string>) => toPub(encodedData._info)
  })
