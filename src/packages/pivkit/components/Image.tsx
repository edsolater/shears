import { KitProps, Piv, useKitProps } from "../../piv"

export type ImageProps = {
  /**
   *  also accept multi srcs
   */
  src?: string | string[]
  fallbackSrc?: string
  /**
   *  for readability
   */
  alt?: string
}

/**
 * if for layout , don't render important content in Box
 * @todo add fallbackSrc
 */
export function Image(rawProps: KitProps<ImageProps>) {
  const { props } = useKitProps<ImageProps>(rawProps)
  /* ---------------------------------- props --------------------------------- */
  return (
    <Piv<'img'>
      as={(parsedPivProps) => <img {...parsedPivProps} />}
      htmlProps={{ src: String(props.src), alt: props.alt }}
      icss={{
        display: 'block'
      }}
      shadowProps={props}
      class={Image.name}
    />
  )
}
