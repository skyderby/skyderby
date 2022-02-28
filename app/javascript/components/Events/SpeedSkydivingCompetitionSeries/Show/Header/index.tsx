import React from 'react'
import styles from 'components/Events/SpeedSkydivingCompetition/Show/Header/styles.module.scss'
import { SpeedSkydivingCompetitionSeries } from 'api/speedSkydivingCompetitionSeries/speedSkydivingCompetitionSeries'
import PlaceLabel from 'components/PlaceLabel'

type HeaderProps = {
  event: SpeedSkydivingCompetitionSeries
}

const Header = ({ event }: HeaderProps): JSX.Element | null => {
  if (!event) return null

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.eventName}>{event.name}</h2>
        <div>
          {event.placeIds.map((id, idx) => {
            return <PlaceLabel withIcon={idx === 0} placeId={id} key={id} refetchEnabled={false} />
          })}
        </div>
      </div>
    </div>
  )
}

export default Header
