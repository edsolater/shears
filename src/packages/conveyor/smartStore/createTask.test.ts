import { expect, test } from 'vitest'
import { createBranchStore } from './createBranch'
import { setShuckVisiable } from './createShuck'
import { createTask } from './createTask'
import { asyncInvoke } from '../../pivkit/hooks/createContextStore/utils/asyncInvoke'

test('basic usage', async () => {
  let effectRunCount = 0
  const { branchStore } = createBranchStore({ testCount: 1 })
  const effect = createTask([branchStore.testCount()], (get) => {
    const n = get(branchStore.testCount())
    effectRunCount++
  })
  effect.register()
  branchStore.testCount().set((n) => n + 1)
  expect(branchStore.testCount()()).toBe(2)
  expect(effectRunCount, 'unvisiable effect not run yet').toBe(0)
  expect(branchStore.testCount().visiable()).toBe(false)
  setShuckVisiable(branchStore.testCount(), true)
  branchStore.testCount().set((n) => n + 1)
  expect(effectRunCount, 'effect should not run yet before async').toBe(0)
  asyncInvoke(() => {
    expect(effectRunCount, 'effect should run 1 time after async').toBe(1)
  })
  expect.assertions(5)
})
