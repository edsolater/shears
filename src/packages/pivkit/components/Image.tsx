import { P } from 'vitest/dist/types-b7007192'
import { KitProps, Piv, useKitProps } from '../../piv'

export interface ImageProps {
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

export interface ImageController {}

const defaultProps = {} as const satisfies Partial<ImageProps>

export type DefaultImageProps = typeof defaultProps
/**
 * if for layout , don't render important content in Box
 * @todo add fallbackSrc
 */
export function Image(rawProps: KitProps<ImageProps>) {
  const { props } = useKitProps(rawProps, { defaultProps })
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
