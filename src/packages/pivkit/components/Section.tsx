import { KitProps, Piv, useKitProps } from '../piv'

export type SectionProps = {
  name?: string
}

export type SectionKitProps = KitProps<SectionProps>

/**
 * if for layout , don't render important content in Box
 */
export function Section(rawProps: SectionKitProps) {
  const { shadowProps, props } = useKitProps(rawProps, { name: 'Section' })
  /* ---------------------------------- props --------------------------------- */
  return <Piv class={`Section ${props.name ?? ''}`} shadowProps={shadowProps} />
}
