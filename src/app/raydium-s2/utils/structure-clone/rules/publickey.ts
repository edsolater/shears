import { getType } from '@edsolater/fnkit'
import { PublicKey } from '@solana/web3.js'
import toPubString from '../../common/pub'
import { addTransportRule } from '../addTransportRule'

export const addRule = () =>
  addTransportRule({
    isTargetInstance: (data) => data instanceof PublicKey || getType(data) as string === 'PublicKey',
    encodeFn: (rawData: PublicKey) => toPubString(rawData)

    // name: 'PublicKey',
    // decodeFn: (encodedData: EncodedObject<string>): PublicKey => wrapToLazyObject(() => toPub(encodedData._info))
  })
