import { KitProps, Piv, useKitProps } from '../../../packages/piv'

export type TextProps = {
  inline?: boolean
}

/**
 * if for layout , don't render important content in Box
 */
export function Text(rawProps: KitProps<TextProps>) {
  const props = useKitProps<TextProps>(rawProps)
  /* ---------------------------------- props --------------------------------- */
  return (
    <Piv
      icss={{
        display: props.inline ? 'inline-block' : undefined
      }}
      shadowProps={props}
      class={Text.name}
    />
  )
}
