import { expect, test } from 'vitest'
import { createBranchStore, debranchify } from './createBranch'
import { isLeaf } from './createLeaf'
test(`basic usage`, () => {
  const { store, setStore } = createBranchStore({ a: 1, b: { c: 2 } })
  setStore({ a: 2 })
  setStore({ b: { c: 3 } })
  expect(isLeaf(store.a)).toBe(true)
  expect(store.a()).toBe(2)
  expect(store.a()).toBe(2)
  expect(store.a()).toBe(2)
  expect(isLeaf(store.b.c)).toBe(true)
  expect(store.b.c()).toBe(3)
})
test(`basic usage`, () => {
  const { store, setStore } = createBranchStore({ a: 1, b: { c: 2 } })
  setStore({ b: { c: 3 } })
  const sub = debranchify(store.b)
  expect(sub).toEqual({ c: 3 })
})
