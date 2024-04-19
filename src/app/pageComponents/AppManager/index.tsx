import { KitProps, createComponentContext, useKitProps } from "@edsolater/pivkit"
import { type Accessor } from "solid-js"
import { useMetaTitle } from "../../hooks/useMetaTitle"
import { AppManager_LayoutBox, AppManager_LayoutBoxProps } from "./LayoutBox"
import { AppManager_NavBar } from "./NavBar"
import { NavSideMenu } from "./SideMenu"

type AppManagerProps = {
  metaTitle?: AppManager_LayoutBoxProps["metaTitle"]
}

export const AppManagerContext = createComponentContext<{
  isSideMenuOpen?: Accessor<boolean>
  isSideMenuFloating?: Accessor<boolean>
  toggleSideMenu?: () => void
}>()

export function AppManager(kitProps: KitProps<AppManagerProps>) {
  const { props, shadowProps } = useKitProps(kitProps)

  // app layout context

  useMetaTitle(() => props.metaTitle)

  return (
    <AppManagerContext.Provider value={{}}>
      <AppManager_LayoutBox
        shadowProps={shadowProps}
        metaTitle={props.metaTitle}
        Topbar={<AppManager_NavBar />}
        Sidebar={<NavSideMenu />}
      >
        {props.children}
      </AppManager_LayoutBox>
    </AppManagerContext.Provider>
  )
}
