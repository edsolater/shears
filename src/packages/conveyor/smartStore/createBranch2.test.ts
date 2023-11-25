import { expect, test } from 'vitest'
import { createBranchStore } from './createBranch2'
import { isLeaf } from './createLeaf'
test(`basic usage`, () => {
  const { store, setStore } = createBranchStore({ a: 1, b: { c: 2 } })
  setStore({ a: 2 })
  setStore({ b: { c: 3 } })
  expect(store.a()).toBe(2)
  expect(store.a()).toBe(2)
  expect(store.a()).toBe(2)
  expect(store.b.c()).toBe(3)
  expect(isLeaf(store.a)).toBe(true)
  expect(isLeaf(store.b.c)).toBe(true)
})

// FIXME: here is bug
test(`will dynamicly create subscribable`, () => {
  const { store, setStore } = createBranchStore<{ a: number; b?: { c: number } }>({ a: 1 })
  setStore({ b: { c: 3 } })
  // expect(store.b?.c?.()).toBe(3)
})

test(`can also access pure rawObj`, () => {
  const { setStore, rawObj } = createBranchStore({ a: 1, b: { c: 2 } })
  setStore({ b: { c: 3 } })
  expect(rawObj.b).toEqual({ c: 3 })
})
