import { NavBar_PageNavMenu, NavBar_PageNavMenuProps } from './NavBar_PageNavMenu'

export type NavBarProps = NavBar_PageNavMenuProps

export function NavBar(props: NavBarProps) {
  return <NavBar_PageNavMenu {...props} />
}
