import { map } from '@edsolater/fnkit'
import { useNavigate, useRoutes } from '@solidjs/router'
import { useKeyboardShortcutRegisterers } from '../../../packages/pivkit/features/useKeyboardShortcut'
import { globalPageShortcuts } from '../configs/globalPageShortcuts'
import { routes } from '../configs/routes'
import '../styles/index.css'

export function App() {
  const Routes = useRoutes(routes)
  const navigate = useNavigate()
  const { registGlobalKeyboardShortcut } = useKeyboardShortcutRegisterers()

  registGlobalKeyboardShortcut(
    map(
      globalPageShortcuts,
      ({ to }) =>
        () =>
          navigate(to)
    )
  )

  // sdf.forEach((i) => console.log('i: ', i))
  return <Routes />
}
