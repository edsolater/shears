import { pick } from '@edsolater/fnkit'
import { decodeRules, DecodeRule } from './decode'
import { encodeRules, EncodeRule } from './encode'

export function addTransportRule(rule: Partial<EncodeRule & DecodeRule>) {
  decodeRules.push(pick(rule, ['name', 'decodeFn']))
  encodeRules.push(pick(rule, ['isTargetInstance', 'encodeFn']))
}
