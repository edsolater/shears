import { expect, test } from 'vitest'
import { createBranchStore } from './createBranch'
import { setLeafVisiable } from './createLeaf'
import { createTask } from './createTask'
import { asyncInvoke } from '../../pivkit/hooks/createContextStore/utils/asyncInvoke'

test('basic usage', async () => {
  let effectRunCount = 0
  const { store } = createBranchStore({ testCount: 1 })
  const effect = createTask([store.testCount], (get) => {
    const n = get(store.testCount)
    effectRunCount++
  })
  effect.register()
  store.testCount.set((n) => n + 1)
  expect(store.testCount()).toBe(2)
  expect(effectRunCount, 'unvisiable effect not run yet').toBe(0)
  expect(store.testCount.visiable()).toBe(false)
  setLeafVisiable(store.testCount, true)
  store.testCount.set((n) => n + 1)
  expect(effectRunCount, 'effect should not run yet before async').toBe(0)
  asyncInvoke(() => {
    expect(effectRunCount, 'effect should run 1 time after async').toBe(1)
  })
  expect.assertions(5)
})
