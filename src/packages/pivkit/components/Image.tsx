import { Piv, UIKit, parsePivProps, useKitProps } from '../../piv'
import { Accessify } from '../utils/accessifyProps'

export interface ImageProps extends UIKit<{ controller: ImageController }> {
  /**
   *  also accept multi srcs
   */
  src?: Accessify<string | string[] | undefined, ImageController>
  fallbackSrc?: Accessify<string | undefined, ImageController>
  /**
   *  for readability
   */
  alt?: Accessify<string | undefined, ImageController>
}

export interface ImageController {}

const defaultProps = {} as const satisfies Partial<ImageProps>

export type DefaultImageProps = typeof defaultProps
/**
 * if for layout , don't render important content in Box
 * @todo add fallbackSrc
 */
export function Image(rawProps: ImageProps) {
  const { props } = useKitProps(rawProps, { defaultProps })
  /* ---------------------------------- props --------------------------------- */
  return (
    <Piv<'img'>
      render:self={(selfProps) => <img {...parsePivProps(selfProps)} />}
      htmlProps={{ src: String(props.src), alt: props.alt }}
      icss={{
        display: 'block',
      }}
      shadowProps={props}
      class={Image.name}
    />
  )
}
