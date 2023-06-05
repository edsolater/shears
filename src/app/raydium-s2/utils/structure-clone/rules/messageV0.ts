import { getType } from '@edsolater/fnkit'
import { MessageV0 } from '@solana/web3.js'
import { wrapToLazyObject } from '../../../../../packages/fnkit/wrapToLazyObject'
import { addTransportRule } from '../addTransportRule'

export const addRule = () =>
  addTransportRule({
    isTargetInstance: (data) => data instanceof MessageV0 || (getType(data) as string) === 'MessageV0',
    encodeFn: (rawData: MessageV0) => ({ _type: 'MessageV0', _info: rawData }),
    name: 'MessageV0',
    // @ts-expect-error TEMP
    decodeFn: (encodedData: any): MessageV0 => wrapToLazyObject(() => new MessageV0(...encodedData._info)),
  })
