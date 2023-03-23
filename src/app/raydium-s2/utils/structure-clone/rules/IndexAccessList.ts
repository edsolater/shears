import { getType } from '@edsolater/fnkit'
import { IndexAccessList } from '../../../../../packages/fnkit/customizedClasses/IndexAccessMap'
import { addTransportRule } from '../addTransportRule'
import { EncodedObject } from '../type'

export const addRule = () =>
  addTransportRule({
    isTargetInstance: (data) => data instanceof IndexAccessList || (getType(data) as string) === 'PublicKey',
    encodeFn: (rawData: IndexAccessList) => rawData['_structureCloneEncode'],
    name: 'IndexAccessList',
    decodeFn: ({ _info }: EncodedObject<any[]>): IndexAccessList => IndexAccessList._structureCloneDecode(_info)
  })
