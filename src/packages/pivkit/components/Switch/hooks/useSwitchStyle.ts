import { Accessor, createMemo } from 'solid-js';
import { DeKitProps, PivProps } from '../../../../piv';
import { SwitchProps } from '../Switch';
import { HTMLCheckboxProps } from "../HTMLCheckbox";
import { LabelProps } from "../../Label";

/**
 * hook for switch's **style**
 */
export function useSwitchStyle(params: { props: DeKitProps<SwitchProps>; isChecked: Accessor<boolean>; }) {
  const wrapperLabelStyleProps = createMemo(
    () => ({
      icss: { width: '14em', height: '2em', background: '#cbd5e0', borderRadius: '999em', padding: 4 }
    } satisfies Partial<LabelProps>)
  );

  const htmlCheckboxStyleProps = createMemo(
    () => ({
      icss: {
        position: 'absolute',
        border: '0px',
        outline: 'none',
        opacity: 0,
        width: '1px',
        height: '1px',
        margin: '-1px',
        overflow: 'hidden'
      }
    } satisfies Partial<HTMLCheckboxProps>)
  );

  const switchThumbStyleProps = createMemo(
    () => ({
      icss: {
        height: '100%',
        aspectRatio: '1',
        borderRadius: '999em',
        background: 'currentColor',
        // translate: params.isChecked() ? '100%' : '0',
        marginLeft: params.isChecked() ? 'auto' : '0',
        transition: '300ms'
      }
    } satisfies Partial<PivProps>)
  );

  return { wrapperLabelStyleProps, htmlCheckboxStyleProps, switchThumbStyleProps };
}
