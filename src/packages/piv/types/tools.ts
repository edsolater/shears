export type ValidProps = Record<string, Exclude<any, Promise<any>>>
export type ValidStatus = object

/**
 * auto omit P2's same name props
 */
export type ExtendsProps<
  P1 extends ValidProps,
  P2 extends ValidProps = {},
  P3 extends ValidProps = {},
  P4 extends ValidProps = {},
  P5 extends ValidProps = {}
> = P1 &
  Omit<P2, keyof P1> &
  Omit<P3, keyof P1 | keyof P2> &
  Omit<P4, keyof P1 | keyof P2 | keyof P3> &
  Omit<P5, keyof P1 | keyof P2 | keyof P3 | keyof P4>
