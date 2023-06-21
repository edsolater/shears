import { Piv } from '../../../packages/piv'
import { Card, Section, icss_card, icss_col } from '../../../packages/pivkit'
import { NavBar } from '../components/NavBar'

export default function HomePage() {
  return (
    <Piv>
      <NavBar title='Home' />
      <Section icss={{ display: 'grid', justifyContent: 'center' }}>
        <Card icss={[icss_card, icss_col({ gap: '.5em' })]}>hello, this is home page</Card>
      </Section>
    </Piv>
  )
}
