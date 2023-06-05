import { getType } from '@edsolater/fnkit'
import {
  IndexAccessList,
  IndexAccessListStructureCloneType,
} from '../../../../../packages/fnkit/customizedClasses/IndexAccessList'
import { addTransportRule } from '../addTransportRule'
import { EncodedObject } from '../type'

export const addRule = () =>
  addTransportRule({
    isTargetInstance: (data) => data instanceof IndexAccessList || (getType(data) as string) === 'IndexAccessList',
    encodeFn: (rawData: IndexAccessList, encodeObject) =>
      rawData['_structureCloneEncode']?.((innerItems) => encodeObject(innerItems)),
    name: 'IndexAccessList',
    decodeFn: ({ _info }: EncodedObject<IndexAccessListStructureCloneType>, decodeObject): IndexAccessList =>
      IndexAccessList._structureCloneDecode(decodeObject(_info)),
  })
