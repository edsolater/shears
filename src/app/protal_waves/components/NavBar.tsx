import { TopMenuBar, TopMenuBarProps } from './TopMenuBar'

export type NavBarProps = TopMenuBarProps

export function NavBar(props: NavBarProps) {
  return <TopMenuBar {...props} />
}
