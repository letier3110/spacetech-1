// import { FC, useMemo } from 'react'
import { FC } from 'react'
import './Card.css'
// import { logEvent } from 'firebase/analytics'
// import { firebaseAnalytics } from '../../lib/firebase/firebase'
import { DataEntry } from '../../lib/interfaces'
// import { generateGmapsLink } from '../../lib/gmaps'
import { generateColor } from '../../lib/utils'

interface CardProps {
  cardData: Omit<DataEntry, 'coordinates'>
  minEffectiveness?: number
  maxEffectiveness?: number
  index?: number
  onClick?: () => void
}

const Card: FC<CardProps> = ({ cardData, index, minEffectiveness, maxEffectiveness, onClick }) => {
  // const link = useMemo(() => generateGmapsLink(cardData.address), [cardData.address])
  return (
    <div
      className='Card'
      style={{
        backgroundColor: cardData.effectiveness
          ? generateColor(Number.parseFloat(cardData.effectiveness ?? '0'), minEffectiveness ?? 0, maxEffectiveness ?? 1)
          : 'xx'
      }}
      onClick={onClick}
    >
      {cardData.mediaUrl && cardData.mediaUrl.length > 0 && <img src={cardData.mediaUrl[0]} className='CardBg' />}
      {cardData.mediaUrl && cardData.mediaUrl.length > 0 && <div className='CardBgCover' />}
      {index && <div className='CardIndex'>{index}</div>}
      <div className='CardName'>{cardData.shortName ?? cardData.address}</div>
      
    </div>
  )
}

export default Card
