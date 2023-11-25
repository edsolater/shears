import { expect, test } from 'vitest'
import { getByPath, walkThroughObject } from './walkThroughObject'
import { isObjectLike } from '@edsolater/fnkit'

test('basic usage', () => {
  const obj = { a: 'a', b: 'b', c: { d: 'd' } }
  walkThroughObject(obj, ({ keyPaths, parentPath, currentKey, value }) => {
    if (currentKey === 'a') {
      expect(value).toBe('a')
    }
    if (currentKey === 'b') {
      expect(value).toBe('b')
    }

    if (currentKey === 'd') {
      expect(value).toBe('d')
      expect(keyPaths).toEqual(['c', 'd'])
    }

    const targetObj = getByPath(obj, parentPath)
    if (isObjectLike(targetObj)) {
      targetObj[currentKey] = 'hello world'
    }
  })
  expect(obj.c.d).toBe('hello world')
})
