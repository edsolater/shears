import { KitProps, Piv, useKitProps } from '../../../packages/piv'

export type TextProps = KitProps<{
  inline?: boolean
  /** if true, it is 'text' */
  editable?: boolean | 'text' | 'all'
}>

/**
 * if for layout , inner content should only be text
 */
export function Text(rawProps: TextProps) {
  const { props } = useKitProps(rawProps)

  const contentEditableValue =
    props.editable != null
      ? props.editable
        ? props.editable === 'text' || props.editable === true
          ? 'plaintext-only'
          : 'true'
        : 'false'
      : undefined

  return (
    <Piv
      icss={{
        display: props.inline ? 'inline-block' : undefined,
      }}
      // @ts-ignore no need this check
      htmlProps={{
        contentEditable: contentEditableValue,
      }}
      shadowProps={props}
      class='Text'
    />
  )
}
