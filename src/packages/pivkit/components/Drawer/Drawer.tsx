import { createSignal, Show } from 'solid-js';
import { KitProps, Piv, useKitProps } from '../../../piv';
import { createRef } from '../../hooks/createRef';
import { drawerKeyboardShortcut } from './plugins/drawerKeyboardShortcut';
import { PopPortal } from './PopPortal';


export type DrawerController = {
  isOpen: boolean;
  placement: NonNullable<DrawerProps['placement']>;
  open(): void;
  close(): void;
  toggle(): void;
};

export type DrawerProps = KitProps<
  {
    open?: boolean;
    placement?: 'from-left' | 'from-bottom' | 'from-top' | 'from-right';
  }, {
    controller: DrawerController;
  }
>;
const drawerDefaultProps = { placement: 'from-right' } satisfies DrawerProps;

export type DrawerDefaultProps = typeof drawerDefaultProps;

export function Drawer(rawProps: DrawerProps) {
  const props = useKitProps(rawProps, {
    defaultProps: drawerDefaultProps,
    plugin: [drawerKeyboardShortcut()],
    controller: (mergedProps) => ({
      get isOpen() {
        return Boolean(isOpen());
      },
      placement: mergedProps.placement,
      open() {
        open();
        drawerRef()?.focus();
      },
      close,
      toggle() {
        if (isOpen()) {
          close();
        } else {
          open();
          drawerRef()?.focus();
        }
      }
    })
  });

  const [drawerRef, setDrawerRef] = createRef<HTMLDivElement>();
  const [isOpen, setIsOpen] = createSignal(props.open);
  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  return (
    <PopPortal>
      <Show when={isOpen()}>
        <Piv
          ref={setDrawerRef}
          shadowProps={props}
          icss={{ width: 400, height: '100dvh', background: 'dodgerblue' }}
        ></Piv>
      </Show>
    </PopPortal>
  );
}
