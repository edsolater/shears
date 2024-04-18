import { KitProps, createComponentContext, useKitProps } from "@edsolater/pivkit"
import { type Accessor } from "solid-js"
import { useMetaTitle } from "../../hooks/useMetaTitle"
import { AppPageLayout_LayoutBox, AppPageLayout_LayoutBoxProps } from "./LayoutBox"
import { AppPageLayout_NavBar } from "./NavBar"
import { NavSideMenu } from "./SideMenu"

type AppPageLayoutProps = {
  metaTitle?: AppPageLayout_LayoutBoxProps["metaTitle"]
}

export const AppPageLayoutContext = createComponentContext<{
  isSideMenuOpen?: Accessor<boolean>
  isSideMenuFloating?: Accessor<boolean>
  toggleSideMenu?: () => void
}>()

export function AppPageLayout(kitProps: KitProps<AppPageLayoutProps>) {
  const { props, shadowProps } = useKitProps(kitProps)

  // app layout context

  useMetaTitle(() => props.metaTitle)

  return (
    <AppPageLayoutContext.Provider value={{}}>
      <AppPageLayout_LayoutBox
        shadowProps={shadowProps}
        metaTitle={props.metaTitle}
        Topbar={<AppPageLayout_NavBar />}
        Sidebar={<NavSideMenu />}
      >
        {props.children}
      </AppPageLayout_LayoutBox>
    </AppPageLayoutContext.Provider>
  )
}
