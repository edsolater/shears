import { Piv, PivProps, useKitProps } from '../../../packages/piv'
import { Accessify } from '../utils/accessifyProps'

export interface TextProps extends PivProps {
  inline?: Accessify<boolean | undefined>
}

/**
 * if for layout , inner content should only be text
 */
export function Text(rawProps: TextProps) {
  const { props } = useKitProps(rawProps)
  /* ---------------------------------- props --------------------------------- */
  return (
    <Piv
      icss={{
        display: props.inline ? 'inline-block' : undefined,
      }}
      shadowProps={props}
      class={Text.name}
    />
  )
}
