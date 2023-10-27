import { useNavigate } from '@solidjs/router'
import { KitProps, Piv, renderHTMLDOM, useKitProps } from '../../packages/pivkit'

export interface LinkProps {
  href?: string
  boxWrapper?: boolean
  // TODO: should auto-detect, not manually set
  innerRoute?: boolean
}

/**
 * tag: `<a>` or `<span>`
 */
export function Link(rawProps: KitProps<LinkProps>) {
  const { props } = useKitProps(rawProps, { name: 'Link' })
  const navigate = useNavigate()
  return (
    <Piv<'a'>
      icss={{ textDecoration: 'none', transition: '150ms', cursor: 'pointer' }}
      render:self={(selfProps) =>
        props.innerRoute
          ? renderHTMLDOM('span', selfProps)
          : renderHTMLDOM('a', selfProps, { href: props.href, rel: 'nofollow noopener noreferrer', target: '_blank' })
      }
      shadowProps={props}
      onClick={() => props.innerRoute && props.href && navigate(props.href)}
    />
  )
}
