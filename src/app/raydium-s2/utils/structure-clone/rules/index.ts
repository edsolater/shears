import { mergeFunction } from '@edsolater/fnkit'
import { addRule as addPublicKeyRule } from './publickey'
import { addRule as addBNRule } from './BN'
import { addRule as addIndexAccessListRule } from './BN'

export const addAllRuleAction = mergeFunction(addPublicKeyRule, addBNRule, addIndexAccessListRule)
