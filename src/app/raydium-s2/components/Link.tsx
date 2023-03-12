import { useNavigate } from '@solidjs/router'
import { KitProps, Piv, useKitProps } from '../../../packages/piv'

export type LinkProps = KitProps<{
  href?: string
  boxWrapper?: boolean
  innerRoute?: boolean
}>

export function Link(rawProps: LinkProps) {
  const props = useKitProps(rawProps)
  const navigate = useNavigate()
  return (
    <Piv<'a'>
      icss={{ textDecoration: 'none', transition: '150ms', cursor: 'pointer' }}
      as={(parsedPivProps) =>
        props.innerRoute ? (
          <span {...parsedPivProps} />
        ) : (
          <a {...parsedPivProps} href={props.href} rel='nofollow noopener noreferrer' target='_blank' />
        )
      }
      shadowProps={props}
      onClick={() => props.innerRoute && props.href && navigate(props.href)}
    />
  )
}
