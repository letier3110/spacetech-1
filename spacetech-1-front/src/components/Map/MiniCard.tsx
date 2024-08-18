import { FC } from 'react'
import { DataEntry } from '../../lib/interfaces'
// import { generateGmapsLink } from '../../lib/gmaps'

interface MiniCardProps {
  cardData: DataEntry
  index?: number
}

const MiniCard: FC<MiniCardProps> = ({ cardData, index }) => {
  // const link = generateGmapsLink(cardData.address)
  const cardEffectiveness = cardData.effectiveness === undefined ? 0 : parseFloat(cardData.effectiveness)
  console.log(cardData, cardEffectiveness)
  return (
    <div className='MiniCard'>
      {cardData.mediaUrl && cardData.mediaUrl.length > 0 && <img src={cardData.mediaUrl[0]} className='MiniCardBg' />}
      {cardData.mediaUrl && cardData.mediaUrl.length > 0 && <div className='MiniCardBgCover' />}
      {index && (<div className='MiniCardIndex'>{index}</div>)}
      <div className='MiniCardName'>Адреса: {cardData.address ?? 'Не вказана'}</div>
      <div className='MiniCardContent'>Площа: {cardData.area} m<sup>2</sup></div>
      <div className='MiniCardContent'>Ефективність: {cardData.effectiveness ? `${(cardEffectiveness * 100).toFixed(2)}%` : ''}</div>
      {/* <a href={link} className='MiniCardDirections' target='_blank' rel='noreferrer'>
        Directions
      </a> */}
    </div>
  )
}

export default MiniCard
