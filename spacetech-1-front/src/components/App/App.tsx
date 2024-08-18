import { FC } from 'react'
import PlacesData from '../../../public/2.json'
import { DataEntry } from '../../lib/interfaces'
import './App.css'
import { ListView } from './ListView'

const data = PlacesData as Array<DataEntry>

const App: FC = () => {
  return <ListView data={data} />
}

export default App
