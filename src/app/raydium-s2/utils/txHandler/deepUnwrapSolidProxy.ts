import { isObjectLiteral, map } from '@edsolater/fnkit';
import { unwrap } from 'solid-js/store';
import { isProxy } from '../../stores/data/utils/calculateSwapRouteInfos_main';

/** solidjs utils */
export function deepUnwrapSolidProxy<T>(data: T): T {
  if (isObjectLiteral(data)) {
    return map(data, (v) => deepUnwrapSolidProxy(v)) as T;
  } else if (isProxy(data)) {
    return unwrap(data);
  } else {
    return data;
  }
}
