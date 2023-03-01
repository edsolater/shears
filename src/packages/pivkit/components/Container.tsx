import { useElementSize } from '@edsolater/pivkit';
import { Accessor } from 'solid-js';
import { JSX } from 'solid-js/jsx-runtime';
import { Piv } from '../../piv/Piv';
import { createRef } from '../hooks/createRef';

export function Container(props: {
  children?: (utils: { width: Accessor<number | undefined>; height: Accessor<number | undefined>; }) => JSX.Element;
}) {
  const [ref, setRef] = createRef<HTMLElement>();
  const { width, height } = useElementSize(ref);
  return (
    <Piv icss={{ width: 'fit-content', height: 'fit-content' }} ref={setRef}>
      {props.children?.({ width, height })}
    </Piv>
  );
}
