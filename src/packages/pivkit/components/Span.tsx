import { KitProps, Piv, renderHTMLDOM, useKitProps } from '../piv';


export type SpanType = {};
export function Span(kitProps: KitProps<SpanType>) {
  const { props, shadowProps } = useKitProps(kitProps, { name: 'Span' });
  return (
    <Piv<'span'> shadowProps={shadowProps} render: self={(selfProps) => renderHTMLDOM('span', selfProps)} />
  );
}
