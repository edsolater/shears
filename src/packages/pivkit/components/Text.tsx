import { KitProps, Piv, useKitProps } from '../../../packages/piv'

export interface TextProps {
  inline?: boolean
}

/**
 * if for layout , inner content should only be text
 */
export function Text(rawProps: KitProps<TextProps>) {
  const { props } = useKitProps(rawProps)
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
