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
    encodeFn: (rawData: IndexAccessList, encodeInner) =>
      rawData['_structureCloneEncode']?.((innerItems) => encodeInner(innerItems)),
    name: 'IndexAccessList',
    decodeFn: ({ _info }: EncodedObject<IndexAccessListStructureCloneType>, decodeInner): IndexAccessList =>
      IndexAccessList._structureCloneDecode(decodeInner(_info)),
  })
