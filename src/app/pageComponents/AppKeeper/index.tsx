import type { MayArray } from "@edsolater/fnkit"
import { KitProps, useKitProps, type KeybordShortcutKeys, type PivChild } from "@edsolater/pivkit"
import { useMetaTitle } from "../../hooks/useMetaTitle"
import { AppKeeperContext } from "./AppKeeperContext"
import { AppKeeper_LayoutBox } from "./LayoutBox"
import { AppKeeper_NavBar } from "./NavBar"
import { NavSideMenu } from "./SideMenu"

export type AppKeeperProps = {
  metaTitle?: string

  "render:contentBanner"?: PivChild
  TopbarBanner?: PivChild

  // ---------------- topbar ----------------
  Topbar?: PivChild
  topbarShortcut?: MayArray<KeybordShortcutKeys>
  topbarCanFloating?: boolean
  topbarFloatingShortcut?: MayArray<KeybordShortcutKeys>

  // ---------------- sidebar ----------------
  Sidebar?: PivChild
  sidebarShortcut?: MayArray<KeybordShortcutKeys>
  sidebarCanFloating?: boolean
  sidebarFloatingShortcut?: MayArray<KeybordShortcutKeys>

  // ---------------- content ----------------
  Content?: PivChild
}

export function AppKeeper(kitProps: KitProps<AppKeeperProps>) {
  const { props, shadowProps } = useKitProps(kitProps)

  return (
    <AppKeeperContext.Provider value={props}>
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
