import { Piv } from '../../../packages/piv'
import { NavBar } from '../components/NavBar'
import { useDataStore } from '../stores/data/store'

export function PlaygroundPage() {
  return (
    <Piv>
      <NavBar title='Playground' />
      <PlaygoundList />
    </Piv>
  )
}

function PlaygoundList() {
  const dataStore = useDataStore()
  return <Piv>Hello world</Piv>
}
