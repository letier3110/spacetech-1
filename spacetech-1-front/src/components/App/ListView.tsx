import { FC, useState } from 'react'
import { CadastrEntry, DataEntry } from '../../lib/interfaces'
// import places from '../../../public/2.json'
// import PlaceModeData from '../../../public/mode.json'
import Card from '../Card/Card'
import Map from '../Map/Map'
import { generateColor } from '../../lib/utils'
import DonutChart from '../DonutChart/DonutChart'

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
  const [searchLocation] = 'м. Славутич'
  const [lat, setLat] = useState(51.5310101)
  const [lng, setLng] = useState(30.7383043)
  const [zoom, setZoom] = useState(13)

  const filteredContent = cardsData.map((card) => {
    const shortName = card.address.split(searchLocation + ',')[1]
    return {
      ...card,
      shortName: shortName && shortName.length > 0 ? shortName : undefined
    }
  })

  const sortedContent = filteredContent.sort((a, b) => {
    if (a.effectiveness && b.effectiveness) {
      return Number.parseFloat(b.effectiveness ?? '0') - Number.parseFloat(a.effectiveness ?? '0')
    } else {
      return !a.effectiveness ? 1 : !b.effectiveness ? -1 : -1
    }
  })

  const onlyWithEffectiveness = (cardsData as unknown[] as Array<Record<string, string>>)
    .concat(cadastrData as unknown[] as Array<Record<string, string>>)
    // const onlyWithEffectiveness = cardsData
    .filter((x) => x?.effectiveness)
    .map((x) => Number.parseFloat(x.effectiveness ?? '0'))
  const min = Math.min(...onlyWithEffectiveness)
  const max = Math.max(...onlyWithEffectiveness)

  const mappedContent = sortedContent.map((x) => {
    const newColor = generateColor(Number.parseFloat(x.effectiveness ?? '0'), min ?? 0, max ?? 1)
    return {
      ...x,
      color: newColor
    }
  })

  const sortedCadastrData = cadastrData.sort((a, b) => {
    if (a.effectiveness && b.effectiveness) {
      return (b.effectiveness ?? 0) - (a.effectiveness ?? 0)
    } else {
      return !a.effectiveness ? 1 : !b.effectiveness ? -1 : -1
    }
  })

  const mappedCadastrData = sortedCadastrData.map((x) => {
    const newColor = generateColor(x.effectiveness ?? 0, min ?? 0, max ?? 1)
    return {
      ...x,
      color: newColor
    }
  })

  const agregatedContent = mappedContent.concat(
    mappedCadastrData.map((x) => ({
      ...x,
      color: '',
      area: x.unit_area === 'га' ? `${(Number.parseFloat(x.area) * 10000).toFixed(2)}` : `${x.area}`
    })) as never
  )
  const bigAreas = agregatedContent.filter((x) => Number.parseInt(x.area) > 10000)
  const midAreas = agregatedContent.filter((x) => Number.parseInt(x.area) < 10000 && Number.parseInt(x.area) > 1000)
  const smallAreas = agregatedContent.filter((x) => Number.parseInt(x.area) < 1000)

  const effectiveAreas = agregatedContent.filter((x) => Number.parseFloat(x.effectiveness ?? '0') > 0.5)
  const optimalAreas = agregatedContent.filter(
    (x) => Number.parseFloat(x.effectiveness ?? '0') <= 0.5 && Number.parseFloat(x.effectiveness ?? '0') > 0.2
  )
  const notEffectiveAreas = agregatedContent.filter((x) => Number.parseFloat(x.effectiveness ?? '0') <= 0.2)

  return (
    <div className='flex flex-column flex-gap AppContainer'>
      <div className='Header'>{/* <div className='flex flex-gap'>{ViewMode}</div> */}</div>
      {/* <div className='MobileHeader'>{ViewMode}</div> */}
      {mapMode && (
        <div className='CardsWithMap'>
          <div className='MapContent'>
            <div>
              <div className='flex flex-gap'>
                <div className='Card CardGhost'>
                  <div className='CardName'>Дахи</div>
                </div>
              </div>
            </div>
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
            <div>
              <div className='flex flex-gap'>
                <div className='Card CardGhost'>
                  <div className='CardName'>Земельні ділянки</div>
                </div>
              </div>
            </div>
            {mappedCadastrData.map((cardData, index) => {
              const longitude = cardData.coordinates[0][0][0]
              const latitude = cardData.coordinates[0][0][1]
              return (
                <Card
                  minEffectiveness={min}
                  maxEffectiveness={max}
                  cardData={{
                    ...cardData,
                    effectiveness: cardData.effectiveness ? cardData.effectiveness.toString() : undefined,
                    longitude: longitude.toString(),
                    latitude: latitude.toString(),
                    address: cardData.address ?? 'Не вказано'
                  }}
                  index={index + 1 + mappedContent.length}
                  key={index}
                  onClick={() => {
                    if (latitude && longitude) {
                      setLat(latitude)
                      setLng(longitude)
                      setZoom(16)
                    }
                  }}
                />
              )
            })}
          </div>
          <Map data={mappedContent} cadastrData={mappedCadastrData} lat={lat} lng={lng} zoom={zoom} />
        </div>
      )}
      <div className='DesktopCharts'>
        <h3>Статистика по громаді</h3>
        <div className='flex flex-gap charts'>
          <DonutChart
            labels={['Дахи', 'Земельні ділянки']}
            dataValues={[mappedContent.length, mappedCadastrData.length]}
          />
          <DonutChart
            labels={['Великі', 'Середні', 'Малі']}
            dataValues={[bigAreas.length, midAreas.length, smallAreas.length]}
          />
          <DonutChart
            labels={['Високо-ефективні', 'Оптимальні', 'Не ефективні']}
            dataValues={[effectiveAreas.length, optimalAreas.length, notEffectiveAreas.length]}
          />
        </div>
      </div>
      {/* <div className='bottom'></div> */}
    </div>
  )
}
