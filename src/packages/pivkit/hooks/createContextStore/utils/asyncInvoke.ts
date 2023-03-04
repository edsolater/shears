import { AnyFn } from '@edsolater/fnkit';

export function asyncInvoke(fn: AnyFn) {
  Promise.resolve().then(fn);
}
