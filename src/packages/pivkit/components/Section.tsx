import { Piv, PivProps } from '../../piv'

export interface SectionProps {}

/**
 * if for layout , don't render important content in Box
 */
export function Section(props: PivProps) {
  /* ---------------------------------- props --------------------------------- */
  return <Piv class={Section.name} {...props} />
}
