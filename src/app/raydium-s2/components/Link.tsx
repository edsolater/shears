import { Piv } from '../../../packages/piv'
import { useNavigate } from '@solidjs/router'
import { JSXElement } from 'solid-js'

export function Link(props: { href: string; boxWrapper?: boolean; innerRoute?: boolean; children?: JSXElement }) {
  const navigate = useNavigate()
  return (
    <Piv<'a'>
      icss={{ textDecoration: 'none', transition: '150ms', cursor:'pointer' }}
      as={(parsedPivProps) =>
        props.innerRoute ? (
          <span {...parsedPivProps} />
        ) : (
          <a {...parsedPivProps} href={props.href} rel='nofollow noopener noreferrer' target='_blank' />
        )
      }
      shadowProps={props}
      onClick={() => props.innerRoute && navigate(props.href)}
    />
  )
}
