import { Accessor, createEffect, createSignal, onCleanup } from 'solid-js';
import { onEvent } from '../../../domkit';

export function useFocus(dom: Accessor<HTMLInputElement | undefined>, defaultValue: boolean = false) {
  const [isFocused, setIsFocused] = createSignal(defaultValue);
  createEffect(() => {
    const el = dom();
    if (el) {
      const { abort: abort1 } = onEvent(el, 'focus', () => setIsFocused(true));
      onCleanup(abort1);
      const { abort: abort2 } = onEvent(el, 'blur', () => setIsFocused(false));
      onCleanup(abort2);
    }
  });
  return isFocused;
}
