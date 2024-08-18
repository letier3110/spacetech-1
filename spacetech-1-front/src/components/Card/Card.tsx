import { FC, useMemo } from 'react'
import './Card.css'
// import { logEvent } from 'firebase/analytics'
// import { firebaseAnalytics } from '../../lib/firebase/firebase'
import { DataEntry } from '../../lib/interfaces'
import { generateGmapsLink } from '../../lib/gmaps'

interface CardProps {
  cardData: DataEntry
  index?: number
}

const Card: FC<CardProps> = ({ cardData, index }) => {
  const link = useMemo(() => generateGmapsLink(cardData.address), [cardData.address])
  return (
    <div className='Card'>
      {cardData.mediaUrl && cardData.mediaUrl.length > 0 && <img src={cardData.mediaUrl[0]} className='CardBg' />}
      {cardData.mediaUrl && cardData.mediaUrl.length > 0 && <div className='CardBgCover' />}
      {index && <div className='CardIndex'>{index}</div>}
      <div className='CardName'>{cardData.address}</div>
      <div className='CardOverlay'>
        <div className='CardOverlayContent'>
          <div className='CardOverlayContentTags flex flex-gap flex-wrap'>
            {/* {cardData.tags.map((tag, index) => (
              <div key={index} className='CardOverlayContentTag'>
                {tag}
              </div>
            ))} */}
          </div>
          <div className='CardOverlayContentRating'>
            <div className='CardOverlayContentRatingStars'>
              {/* <div
                className='CardOverlayContentRatingStarsFilled'
                style={{ width: `${(cardData.medianRating / 10) * 100}%` }}
              />

              <div className='CardOverlayContentRatingStarsEmpty' /> */}
            </div>
          </div>
          <div className='CardOverlayContentInfo'>
            {/* {cardData.numberOfRatings}

            <span>ratings</span>

            <span>•</span>

            {cardData.medianRating}

            <span>stars</span> */}
          </div>
          <a href={link} className='directions' target='_blank' rel='noreferrer'>
            Directions
          </a>
        </div>
      </div>
    </div>
  )
}

export default Card