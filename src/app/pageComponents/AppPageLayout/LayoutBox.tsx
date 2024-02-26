import {
  Box,
  Fragnment,
  KitProps,
  Main,
  PivChild,
  cssLinearGradient,
  cssVar,
  icssCol,
  icssGrid,
  renderAsHTMLAside,
  useKitProps
} from '@edsolater/pivkit'
import { createSignal } from 'solid-js'
import { Item } from '../../../packages/pivkit'
import { useMetaTitle } from '../../hooks/useDocumentMetaTitle'

export type AppPageLayout_LayoutBoxProps = {
  metaTitle?: string

  'render:contentBanner'?: PivChild
  'render:topBarBanner'?: PivChild
  'render:topBar'?: PivChild
  'render:sideBar'?: PivChild
  'renderContent'?: PivChild
}
/**
 * for easier to code and read
 *
 * TEMP: add haveData to fix scrolling bug
 */
export function AppPageLayout_LayoutBox(kitProps: KitProps<AppPageLayout_LayoutBoxProps>) {
  const { props } = useKitProps(kitProps)
  useMetaTitle(props.metaTitle)
  const [isSideMenuOpen, setIsSideMenuOpen] = createSignal(false)
  return (
    <Box
      icss={{
        position: 'relative',
        width: '100%',
        height: '100%',
        padding:
          'env(safe-area-inset-top, 0px) env(safe-area-inset-right, 0px) env(safe-area-inset-bottom, 0px) env(safe-area-inset-left, 0px)',
        display: 'grid',
        gridTemplate: `
          "ban  ban    " auto
          "top  top    " auto
          "side content" 1fr / auto 1fr`,
        overflow: 'hidden',
        willChange: 'opacity',
      }}
    >
      <Item name={'top-banner'} icss={{ gridArea: 'ban' }}>
        {props['render:topBarBanner']}
      </Item>
      <Item name={'top-menu'} icss={{ gridArea: 'top' }}>
        {props['render:topBar']}
      </Item>
      <Item name={'side-menu'} icss={{ gridArea: 'side' }} render:self={renderAsHTMLAside}>
        {props['render:sideBar']}
      </Item>
      <Item name={'content'} icss={[{ gridArea: 'content' }, icssGrid]}>
        <Main
          icss={[
            icssCol,
            { position: 'relative', overflow: 'hidden' },
            {
              background: cssLinearGradient({ colors: [cssVar('--content-bg__01'), cssVar('--content-bg__02')] }),
              borderTopLeftRadius: '20px',
            },
          ]}
        >
          <Fragnment>{props['render:contentBanner']}</Fragnment>
          <Box
            icss={[
              icssCol({ childItems: 'none' }),
              {
                flexGrow: 1,
                height: 0,
                isolation: 'isolate',
                padding: '24px',
                display: 'grid',
                gridAutoFlow: 'column',
                overflowY: 'scroll',
                overflowX: 'hidden',
              },
            ]}
          >
            {props.children}
          </Box>
        </Main>
      </Item>
    </Box>
  )
}
