import { pick } from '@edsolater/fnkit'
import { decodeRules, DecodeRuleItem } from './decode'
import { encodeClassRule, EncodeRuleItem } from './encode'

export function addTransportRule(rule: EncodeRuleItem & DecodeRuleItem) {
  decodeRules.push(pick(rule, ['name', 'decodeFn']))
  encodeClassRule.push(pick(rule, ['class', 'encodeFn']))
}
