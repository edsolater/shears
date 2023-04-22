import { KeybordShortcutKeys } from '../../../packages/domkit/gesture/handleKeyboardShortcut'
import { farmsRoutePath, homeRoutePath, pairsRoutePath } from './routes'

export const globalPageShortcuts = {
  'go to pools': {
    shortcut: 'alt + p',
    to: pairsRoutePath
  },
  'go to farms': {
    shortcut: 'alt + f',
    to: farmsRoutePath
  },
  'go to home': {
    shortcut: 'alt + /',
    to: homeRoutePath
  }
} satisfies Record<string, { to: string; shortcut: KeybordShortcutKeys }>
