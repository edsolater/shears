import { mergeFunction } from '@edsolater/fnkit'
import { addRule as addPublicKeyRule } from './publickey'
import { addRule as addBNRule } from './BN'
import { addRule as addIndexAccessListRule } from './IndexAccessList'

export const addAllRuleAction = mergeFunction(addPublicKeyRule, addBNRule, addIndexAccessListRule)
