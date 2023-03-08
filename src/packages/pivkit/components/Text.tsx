import { KitProps, Piv, useKitProps } from '@edsolater/piv'

export type TextProps = KitProps<{
  inline?: boolean
}>

/**
 * if for layout , don't render important content in Box
 */
export function Text(rawProps: TextProps) {
  const props = useKitProps(rawProps)
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