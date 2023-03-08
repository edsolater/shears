import { mergeFunction } from '@edsolater/fnkit'
import { addRule as addPublicKeyRule } from './publickey'
import { addRule as addBNRule } from './BN'

export const addAllRuleAction = mergeFunction(addPublicKeyRule, addBNRule)