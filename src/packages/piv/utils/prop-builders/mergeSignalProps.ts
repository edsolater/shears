import { flap, mergeObjectsWithConfigs, parallelSwitch, shakeNil } from '@edsolater/fnkit'
import { createMemo } from 'solid-js'
import { ValidProps } from '../../types/tools'
import { mergeRefs } from './mergeRefs'
import { SignalizeProps } from './signalizeProps'

type MergeSignalPropsOptions = {
  useCreateMemo?: boolean
}

export function mergeSignalProps<P1 = SignalizeProps<ValidProps>, P2 = SignalizeProps<ValidProps>>(
  propsObjs: [P1, P2],
  options?: MergeSignalPropsOptions
): Exclude<P1 & P2, undefined>
export function mergeSignalProps<
  P1 = SignalizeProps<ValidProps>,
  P2 = SignalizeProps<ValidProps>,
  P3 = SignalizeProps<ValidProps>
>(propsObjs: [P1, P2, P3], options?: MergeSignalPropsOptions): Exclude<P1 & P2 & P3, undefined>
export function mergeSignalProps<
  P1 = SignalizeProps<ValidProps>,
  P2 = SignalizeProps<ValidProps>,
  P3 = SignalizeProps<ValidProps>,
  P4 = SignalizeProps<ValidProps>
>(propsObjs: [P1, P2, P3, P4], options?: MergeSignalPropsOptions): Exclude<P1 & P2 & P3 & P4, undefined>
export function mergeSignalProps<
  P1 = SignalizeProps<ValidProps>,
  P2 = SignalizeProps<ValidProps>,
  P3 = SignalizeProps<ValidProps>,
  P4 = SignalizeProps<ValidProps>,
  P5 = SignalizeProps<ValidProps>
>(propsObjs: [P1, P2, P3, P4, P5], options?: MergeSignalPropsOptions): Exclude<P1 & P2 & P3 & P4 & P5, undefined>
export function mergeSignalProps<P extends SignalizeProps<ValidProps> | undefined>(
  propsObjs: P[],
  options?: MergeSignalPropsOptions
): Exclude<P, undefined>
export function mergeSignalProps<P extends SignalizeProps<ValidProps> | undefined>(
  propsObjs: P[],
  options?: MergeSignalPropsOptions
): Exclude<P, undefined> {
  // @ts-ignore
  if (propsObjs.length <= 1) return propsObjs[0] ?? {}
  const trimedProps = shakeNil(flap(propsObjs))
  // @ts-ignore
  if (trimedProps.length <= 1) return trimedProps[0] ?? {}

  const mergedResult = mergeObjectsWithConfigs(trimedProps, ({ key, valueA: v1, valueB: v2 }) => {
    return parallelSwitch(
      key,
      [
        // special div props
        [
          'domRef',
          () =>
            v1 && v2
              ? options?.useCreateMemo
                ? createMemo(() => mergeRefs(v1(), v2()))
                : () => mergeRefs(v1(), v2())
              : v1 ?? v2
        ],
        [
          'className',
          () =>
            v1 && v2 ? (options?.useCreateMemo ? createMemo(() => [v1, v2].flat()) : () => [v1, v2].flat()) : v1 ?? v2
        ],
        [
          'style',
          () =>
            v1 && v2 ? (options?.useCreateMemo ? createMemo(() => [v1, v2].flat()) : () => [v1, v2].flat()) : v1 ?? v2
        ],
        [
          'icss',
          () =>
            v1 && v2 ? (options?.useCreateMemo ? createMemo(() => [v1, v2].flat()) : () => [v1, v2].flat()) : v1 ?? v2
        ],
        [
          'htmlProps',
          () =>
            v1 && v2 ? (options?.useCreateMemo ? createMemo(() => [v1, v2].flat()) : () => [v1, v2].flat()) : v1 ?? v2
        ],
        [
          'shadowProps',
          () =>
            v1 && v2 ? (options?.useCreateMemo ? createMemo(() => [v1, v2].flat()) : () => [v1, v2].flat()) : v1 ?? v2
        ],
        [
          'plugin',
          () =>
            v1 && v2 ? (options?.useCreateMemo ? createMemo(() => [v1, v2].flat()) : () => [v1, v2].flat()) : v1 ?? v2
        ],
        [
          'dangerousRenderWrapperNode',
          () =>
            v1 && v2 ? (options?.useCreateMemo ? createMemo(() => [v1, v2].flat()) : () => [v1, v2].flat()) : v1 ?? v2
        ],
        [
          'controller',
          () =>
            v1 && v2 ? (options?.useCreateMemo ? createMemo(() => [v1, v2].flat()) : () => [v1, v2].flat()) : v1 ?? v2
        ],
        ['children', () => v2 ?? v1]
      ],
      v2 ?? v1
    )
  })
  // @ts-ignore
  return mergedResult
}
