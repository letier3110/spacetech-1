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

export const ListView: FC<ListViewProps> = ({ data: cardsData, cadastrData }) => {
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

  const sortedContent = filteredContent.sort((a, b) => {
    if(a.effectiveness && b.effectiveness) {
      return Number.parseFloat(b.effectiveness ?? '0') - Number.parseFloat(a.effectiveness ?? '0')
    } else {
      return !a.effectiveness ? 1 : !b.effectiveness ? -1 : -1
    }
  });

  const onlyWithEffectiveness = ((cardsData as unknown[] as Array<Record<string, string>>).concat(cadastrData as unknown[] as Array<Record<string, string>>))
  // const onlyWithEffectiveness = cardsData
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

  const mappedCadastrData = cadastrData.map(x => {
    const newColor = generateColor(x.effectiveness ?? 0, min ?? 0, max ?? 1);
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
          <Map data={mappedContent} cadastrData={mappedCadastrData} lat={lat} lng={lng} zoom={zoom} />
        </div>
      )}
      {/* <div className='bottom'></div> */}
    </div>
  )
}
