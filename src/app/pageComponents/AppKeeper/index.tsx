import { KitProps, createComponentContext, useKitProps } from "@edsolater/pivkit"
import { type Accessor } from "solid-js"
import { useMetaTitle } from "../../hooks/useMetaTitle"
import { AppKeeper_LayoutBox, AppKeeper_LayoutBoxProps } from "./LayoutBox"
import { AppKeeper_NavBar } from "./NavBar"
import { NavSideMenu } from "./SideMenu"

type AppKeeperProps = {
  metaTitle?: AppKeeper_LayoutBoxProps["metaTitle"]
}

export const AppKeeperContext = createComponentContext<{
  isSideMenuOpen?: Accessor<boolean>
  isSideMenuFloating?: Accessor<boolean>
  toggleSideMenu?: () => void
}>()

export function AppKeeper(kitProps: KitProps<AppKeeperProps>) {
  const { props, shadowProps } = useKitProps(kitProps)

  // app layout context

  useMetaTitle(() => props.metaTitle)

  return (
    <AppKeeperContext.Provider value={{}}>
      <AppKeeper_LayoutBox
        shadowProps={shadowProps}
        metaTitle={props.metaTitle}
        Topbar={<AppKeeper_NavBar />}
        Sidebar={<NavSideMenu />}
      >
        {props.children}
      </AppKeeper_LayoutBox>
    </AppKeeperContext.Provider>
  )
}
