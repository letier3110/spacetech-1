import { FC } from 'react'
import PlacesData from '../../../public/2.json'
import CadastrData from '../../../public/4.json'
import { CadastrEntry, DataEntry } from '../../lib/interfaces'
import './App.css'
import { ListView } from './ListView'

const data = PlacesData as Array<DataEntry>
const cadastrData = CadastrData as Array<CadastrEntry>

const App: FC = () => {
  return <ListView data={data} cadastrData={cadastrData} />
}

export default App
