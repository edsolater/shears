import { createMemo } from 'solid-js'
import { Accessify, deAccessify } from '../../../../packages/pivkit'
import { Token, isToken } from '../../../utils/dataStructures/Token'
import { store } from '../dataStore'

/** easy to use & easy to read */
export function useToken(mint: Accessify<string | Token> | undefined) {
  return createMemo(() => {
    if (!mint) return undefined
    const value = deAccessify(mint)
    if (isToken(value)) return value
    else return store.tokens?.[value]
  })
}
