import { createStoreAtom } from '../../../packages/pivkit'

export const themeMode = createStoreAtom<'auto' | 'light' | 'dark'>('auto')
