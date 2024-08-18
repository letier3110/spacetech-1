import { FC, useState } from 'react'
import { CadastrEntry, DataEntry } from '../../lib/interfaces'
// import places from '../../../public/2.json'
// import PlaceModeData from '../../../public/mode.json'
import Card from '../Card/Card'
import Map from '../Map/Map'
import { generateColor } from '../../lib/utils'

// interface IFilter {
//   search: string
//   tags: string[]
//   sort: string
// }

interface ListViewProps {
  data: Array<DataEntry>
  cadastrData: Array<CadastrEntry>
}

export const ListView: FC<ListViewProps> = ({ data: cardsData }) => {
  const [mapMode] = useState(true)
  const [searchLocation] = ('м. Славутич')
  const [lat, setLat] = useState(51.5310101)
  const [lng, setLng] = useState(30.7383043)
  const [zoom, setZoom] = useState(13)

  const filteredContent = cardsData.map((card) => {
    const shortName = card.address.split(searchLocation + ',')[1];
    return {
      ...card,
      shortName: shortName && shortName.length > 0 ? shortName : undefined
    }
  })
  // .filter((card) => currentMode?.value.every((tag) => card.tags.includes(tag)))
  // .filter((card) => {
  //   if (filters.tags.length > 0) {
  //     return filters.tags.every((tag) => card.tags.includes(tag))
  //   }
  //   return true
  // })

  // const maxTagItems = 3
  // const unlimitedFilters = tagGroups
  //   .filter((group) => group.values.some((tag) => tag.value.toLowerCase().includes(searchInFilters.toLowerCase())))
  //   .map((group) => {
  //     const tags = group.values.filter((tag) => tag.value.toLowerCase().includes(searchInFilters.toLowerCase()))
  //     return {
  //       groupName: group.groupName,
  //       values: tags
  //     }
  //   })
  //   .map((group) => {
  //     const tags = group.values.filter((tag) => !filters.tags.includes(tag.value))
  //     return {
  //       groupName: group.groupName,
  //       values: tags.length > maxTagItems ? tags.slice(0, maxTagItems) : tags
  //     }
  //   })
  // const filteredTagItems = unlimitedFilters.filter((group) => group.values.length > 0)

  // const ViewMode = (
  //   <div className='ViewMode'>
  //     <button className='ViewModeBtn outline' onClick={() => {}}>
  //       {mapMode ? 'Map View' : 'Grid View'}
  //     </button>
  //   </div>
  // )

  const sortedContent = filteredContent.sort((a, b) => {
    // if (filters.sort === 'rating') {
    //   return b.medianRating - a.medianRating
    // }
    // if (filters.sort === 'popularity') {
    //   return b.numberOfRatings - a.numberOfRatings
    // }
    if(a.effectiveness && b.effectiveness) {
      return Number.parseFloat(b.effectiveness ?? '0') - Number.parseFloat(a.effectiveness ?? '0')
    } else {
      return !a.effectiveness ? 1 : !b.effectiveness ? -1 : -1
    }
  });

  const onlyWithEffectiveness = cardsData
    .filter((x) => x?.effectiveness)
    .map((x) => Number.parseFloat(x.effectiveness ?? '0'))
  const min = Math.min(...onlyWithEffectiveness)
  const max = Math.max(...onlyWithEffectiveness)

  const mappedContent = sortedContent.map(x => {
    const newColor = generateColor(Number.parseFloat(x.effectiveness ?? '0'), min ?? 0, max ?? 1);
    return {
      ...x,
      color: newColor
    }
  })

  // console.log('mappedContent', mappedContent)

  return (
    <div className='flex flex-column flex-gap AppContainer'>
      <div className='Header'>{/* <div className='flex flex-gap'>{ViewMode}</div> */}</div>
      {/* <div className='MobileHeader'>{ViewMode}</div> */}

      {mapMode && (
        <div className='CardsWithMap'>
          <div className='MapContent'>
            {mappedContent.map((cardData, index) => (
              <Card
                minEffectiveness={min}
                maxEffectiveness={max}
                cardData={cardData}
                index={index + 1}
                key={index}
                onClick={() => {
                  if (cardData.latitude && cardData.longitude && cardData.latitude !== 'Not found') {
                    setLat(Number.parseFloat(cardData.latitude))
                    setLng(Number.parseFloat(cardData.longitude))
                    setZoom(16)
                  }
                }}
              />
            ))}
          </div>
          <Map data={mappedContent} lat={lat} lng={lng} zoom={zoom} />
        </div>
      )}
      {/* <div className='bottom'></div> */}
    </div>
  )
}
