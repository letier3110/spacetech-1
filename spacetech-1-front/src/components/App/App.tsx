import { FC } from 'react'
// import CardsData from '../../../public/data.json'
// import { DataEntry } from '../../lib/interfaces'
import './App.css'
import { ListView } from './ListView'

// const data = CardsData as { data: Array<DataEntry> }
// const cardsData = data.data

const App: FC = () => {
  return <ListView data={[]} />
}

export default App
