import { AnyFn } from '@edsolater/fnkit'

export type ValidProps = Record<string, Exclude<any, Promise<any>>>

/**
 * includes component controller and component methods
 */
export type ValidController = () => ControllerBody
export type ControllerBody = Record<string, any>

/**
 * auto omit P2's same name props
 */
export type ExtendsProps<
  P1 extends ValidProps,
  P2 extends ValidProps = {},
  P3 extends ValidProps = {},
  P4 extends ValidProps = {}
> = P1 & Omit<P2, keyof P1> & Omit<P3, keyof P1 | keyof P2> & Omit<P4, keyof P1 | keyof P2 | keyof P3>

/**
 * recursively
 * we use signal to make reading code clearer, as getter is magic, it's confusing in large APP, so
 *
 * object literal or array type will inner be signal, not container
 */
export type SignalizeProps<T extends object | undefined> = {
  [K in keyof T]: T[K] extends AnyFn ? T[K] : () => T[K]
}
