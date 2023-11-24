import { expect, test } from 'vitest'
import { createTask } from './createTask'
test('basic usage', () => {
  let count = 0
  function runCount() {
    count++
  }
  const effect = createTask((get) => {})
})
