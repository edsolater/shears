import { taskOptionTag } from './createTaskAtom';

export type TaskAtomOption<T = any> = {
  value: T;
  visiable: boolean;
  [taskOptionTag]: true;
};

export function createTaskAtomOption<T>(description: { value: T; visiable: boolean; }): TaskAtomOption<T> {
  return {
    value: description.value,
    visiable: description.visiable,
    [taskOptionTag]: true,
  };
}
export function isTaskAtomOption<T>(value: any): value is TaskAtomOption<T> {
  return value?.[taskOptionTag];
}
