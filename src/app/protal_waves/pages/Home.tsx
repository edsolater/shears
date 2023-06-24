import { Piv } from '../../../packages/piv'
import { Box, Card, Input, Section, icss_card, icss_col } from '../../../packages/pivkit'
import { NavBar } from '../components/NavBar'

export default function HomePage() {

  return (
    <Piv>
      <NavBar title='Home' />
      <Section icss={{ display: 'grid', justifyContent: 'center' }}>
        <Box>
          <Input />
        </Box>
        <Card icss={[icss_card, icss_col({ gap: '.5em' })]}>hello, this is home page</Card>
        <Piv icss={{ width: '80vw', height: '60vh' }}>
          <iframe src='https://search.bilibili.com/all?keyword=hello+world' width='100%' height='100%'></iframe>
        </Piv>
      </Section>
    </Piv>
  )
}
