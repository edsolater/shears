import { useNavigate } from '@solidjs/router'
import { KitProps, Piv, renderHTMLDOM, useKitProps } from '../../packages/pivkit'

export interface LinkProps {
  href?: string
  boxWrapper?: boolean
  innerRoute?: boolean
}

export function Link(rawProps: KitProps<LinkProps>) {
  const { props } = useKitProps(rawProps)
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
