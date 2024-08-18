import { FC, useState } from 'react'
import { DataEntry } from '../../lib/interfaces'
// import tagGroups from '../../../public/filters.json'
// import PlaceModeData from '../../../public/mode.json'
// import Card from '../card/Card'
import Map from '../Map/Map'

// interface IFilter {
//   search: string
//   tags: string[]
//   sort: string
// }

interface ListViewProps {
  data: Array<DataEntry>
}

export const ListView: FC<ListViewProps> = () => {
  const [mapMode] = useState(true)

  // const ViewMode = (
  //   <div className='ViewMode'>
  //     <button className='ViewModeBtn outline' onClick={() => {}}>
  //       {mapMode ? 'Map View' : 'Grid View'}
  //     </button>
  //   </div>
  // )

  return (
    <div className='flex flex-column flex-gap AppContainer'>
      <div className='Header'>
        {/* <div className='flex flex-gap'>{ViewMode}</div> */}
      </div>
      {/* <div className='MobileHeader'>{ViewMode}</div> */}

      {mapMode && (
        <div className='CardsWithMap'>
          <div className='MapContent'>
            {/* {filteredContent.map((cardData, index) => (
              <Card cardData={cardData} index={index + 1} key={index} />
            ))} */}
          </div>
          <Map data={[]} />
        </div>
      )}
      {/* <div className='bottom'></div> */}
    </div>
  )
}
