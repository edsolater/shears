import { Piv, PivProps, useKitProps } from '../../piv';


export interface LabelProps extends PivProps { }
/**
 * created for form widget component
 *
 * !`<label>` can transpond click/focus event for inner `<Input>`-like Node
 */
export function Label(rawProps: LabelProps) {
  const { props } = useKitProps(rawProps);
  return (
    <Piv
      class='Label'
      as={(parsedPivProps) => <label {...parsedPivProps} />} // why set as will render twice
      shadowProps={props} />
  );
}
