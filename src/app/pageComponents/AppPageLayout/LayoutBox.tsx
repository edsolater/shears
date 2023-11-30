import { createSignal } from 'solid-js'
import {
  Box,
  Group,
  KitProps,
  PivChild,
  cssLinearGradient,
  cssVar,
  icss_col,
  icss_grid,
  useKitProps,
} from '../../../packages/pivkit'
import { useMetaTitle } from '../../hooks/useDocumentMetaTitle'
import { Main } from '../../../packages/pivkit/components/Boxes/Main'

export type AppPageLayout_LayoutBoxProps = {
  metaTitle?: string

  'render:contentBanner'?: PivChild
  'render:topBarBanner'?: PivChild
  'render:topBar'?: PivChild
  'render:sideBar'?: PivChild
  'render:content'?: PivChild
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
          "ban  ban" auto
          "top  top" auto
          "side ctn" 1fr / auto 1fr`,
        overflow: 'hidden',
        willChange: 'opacity',
      }}
    >
      <Group name={'top-banner'} icss={{ gridArea: 'ban' }}>
        {props['render:topBarBanner']}
      </Group>
      <Group name={'top-menu'} icss={{ gridArea: 'top' }}>
        {props['render:topBar']}
      </Group>
      <Group name={'side-menu'} icss={{ gridArea: 'side' }}>
        {props['render:sideBar']}
      </Group>
      <Group name={'content'} icss={[{ gridArea: 'ctn' }, icss_grid]}>
        <Main
          icss={[
            icss_col,
            { position: 'relative', overflowX: 'hidden', overflowY: 'scroll' },
            {
              background: cssLinearGradient({ colors: [cssVar('--content-bg__01'), cssVar('--content-bg__02')] }),
              borderTopLeftRadius: '20px',
            },
          ]}
        >
          {props['render:contentBanner']}
          <Box
            icss={[
              icss_col({ childItems: 'none' }),
              {
                flexGrow: 1,
                height: 0,
                isolation: 'isolate',
                padding: '48px',
              },
            ]}
          >
            {props.children}
          </Box>
        </Main>
      </Group>
    </Box>
  )
}
