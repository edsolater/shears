import { leafOptionTag } from './createLeaf';

export type LeafOption<T = any> = {
  value: T;
  visiable: boolean;
  [leafOptionTag]: true;
};

export function createLeafOption<T>(description: { value: T; visiable: boolean; }): LeafOption<T> {
  return {
    value: description.value,
    visiable: description.visiable,
    [leafOptionTag]: true,
  };
}
export function isLeafOption<T>(value: any): value is LeafOption<T> {
  return value?.[leafOptionTag];
}
