import React from 'react'

import PlaceLabel from 'components/PlaceLabel'
import Navbar from './Navbar'
import styles from './styles.module.scss'
import { SpeedSkydivingCompetition } from 'api/speedSkydivingCompetitions'

type HeaderProps = {
  event: SpeedSkydivingCompetition
}

const Header = ({ event }: HeaderProps): JSX.Element | null => {
  if (!event) return null

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.eventName}>{event.name}</h2>
        <PlaceLabel withIcon withMsl placeId={event.placeId} />
      </div>
      <Navbar event={event} />
    </div>
  )
}

export default Header
