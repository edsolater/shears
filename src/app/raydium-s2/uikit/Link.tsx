import { Piv } from '@edsolater/piv'
import { useNavigate } from '@solidjs/router'
import { JSXElement } from 'solid-js'

export function Link(props: { href: string; boxWrapper?: boolean; innerRoute?: boolean; children?: JSXElement }) {
  const navigate = useNavigate()
  return (
    <Piv<'a'>
      icss={{ textDecoration: 'none', transition: '150ms' }}
      as={(parsedPivProps) =>
        props.innerRoute ? (
          <a {...parsedPivProps} href={props.href} rel='nofollow noopener noreferrer' target='_blank' />
        ) : (
          <span {...parsedPivProps} />
        )
      }
      shadowProps={props}
      onClick={() => props.innerRoute && navigate(props.href)}
    />
  )
}
