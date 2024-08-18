import { FC } from 'react'
import { DataEntry } from '../../lib/interfaces'
// import { generateGmapsLink } from '../../lib/gmaps'

interface MiniCardProps {
  cardData: DataEntry
  index?: number
}

const MiniCard: FC<MiniCardProps> = ({ cardData, index }) => {
  // const link = generateGmapsLink(cardData.address)
  const solarKit = JSON.parse(cardData.solar_kit as unknown as string)
  const cardEffectiveness = cardData.effectiveness === undefined ? 0 : parseFloat(cardData.effectiveness)
  const exactEffectiveness = (cardEffectiveness * 100).toFixed(2)
  console.log(cardData)
  return (
    <div className='MiniCard'>
      {cardData.mediaUrl && cardData.mediaUrl.length > 0 && <img src={cardData.mediaUrl[0]} className='MiniCardBg' />}
      {cardData.mediaUrl && cardData.mediaUrl.length > 0 && <div className='MiniCardBgCover' />}
      {index && <div className='MiniCardIndex'>{index}</div>}
      <div className='MiniCardName'>Адреса: {cardData.address ?? 'Не вказана'}</div>
      <div className='MiniCardContent'>
        Площа: {cardData.area} m<sup>2</sup>
      </div>
      <div className='MiniCardContent'>
        Ефективність: {cardData.effectiveness ? `${exactEffectiveness}%` : ''}
      </div>
      <div className='MiniCardContent'>
        Потенційна потужність:{' '}
        {(cardEffectiveness *
          (solarKit.count ?? 0) *
          Number.parseInt((solarKit.total_power ?? '0').split(' Вт')[0])).toFixed(0)} Вт
      </div>
      <div className='MiniCardContent'>Середня вартість забудови СЕС: ${solarKit.cost}</div>
      {/* <a href={link} className='MiniCardDirections' target='_blank' rel='noreferrer'>
        Directions
      </a> */}
    </div>
  )
}

export default MiniCard
