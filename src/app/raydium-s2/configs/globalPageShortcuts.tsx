import { farmsRoutePath, homeRoutePath, pairsRoutePath } from './routes';
import { KeybordShortcutKeys } from '../../../packages/domkit/gesture/handleKeyboardShortcut';

export const globalPageShortcuts = {
  'alt + p': {
    to: pairsRoutePath,
  },
  'alt + f': {
    to: farmsRoutePath
  },
  'alt + /': {
    to: homeRoutePath
  }
} satisfies Partial<Record<KeybordShortcutKeys, { to: string; }>>;
