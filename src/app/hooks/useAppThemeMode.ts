import { createEffect } from 'solid-js'

export function useAppThemeMode(options: { mode?: 'light' | 'dark' }) {
  createEffect(() => {
    document.documentElement.classList.remove('light')
    document.documentElement.classList.remove('dark')
    options.mode && document.documentElement.classList.add(options.mode)
  })
}
