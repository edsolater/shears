import { Piv } from '../../../packages/piv'
import { Box, Card, Text, Input, List, Section, icss_card, icss_col, icss_row } from '../../../packages/pivkit'
import { NavBar } from '../components/NavBar'
import { linkCards } from '../configs/linkCards'

export default function HomePage() {
  const links = linkCards

  return (
    <Piv>
      <NavBar title='Home' />
      <Section icss={{ display: 'grid', justifyContent: 'center' }}>
        <Box>
          <Input />
        </Box>
        <Piv icss={{ width: '80vw', height: '60vh' }}>
          <List items={links}>
            {(item) => (
              <Card icss={[icss_card, icss_row({ gap: '.5em', items: 'center' })]}>
                <Text icss={{ fontSize: '2em', fontWeight: 'bold' }}>{item.name}</Text>
                <List icss={icss_row({ gap: '.5em' })} items={item.keywords}>
                  {(keyword) => <Text icss={{ fontSize: '1em' }}>{keyword}</Text>}
                </List>
              </Card>
            )}
          </List>
        </Piv>
      </Section>
    </Piv>
  )
}
