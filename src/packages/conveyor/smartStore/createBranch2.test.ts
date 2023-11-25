import { expect, test } from 'vitest'
import { createBranchStore, debranchify } from './createBranch'
import { isLeaf } from './createLeaf'
test(`basic usage`, () => {
  const { store, setStore } = createBranchStore({ a: 1, b: { c: 2 } })
  setStore({ a: 2 })
  setStore({ b: { c: 3 } })
  // expect(isLeaf(store.a)).toBe(true)
  expect(store.a()).toBe(2)
  expect(store.a()).toBe(2)
  expect(store.a()).toBe(2)
  expect(store.b.c()).toBe(3)
  // expect(isLeaf(store.b.c)).toBe(true)
})
test(`will dynamicly create subscribable`, () => {
  const { store, setStore } = createBranchStore<{ a: number; b?: number }>({ a: 1 })
  expect(typeof store.b).toBe('object')
})
test(`basic usage`, () => {
  const { store, setStore } = createBranchStore({ a: 1, b: { c: 2 } })
  setStore({ b: { c: 3 } })
  const sub = debranchify(store.b)
  expect(sub).toEqual({ c: 3 })
})
