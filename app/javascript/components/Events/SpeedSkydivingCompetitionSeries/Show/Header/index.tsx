import React from 'react'
import styles from 'components/Events/SpeedSkydivingCompetition/Show/Header/styles.module.scss'
import { SpeedSkydivingCompetitionSeries } from 'api/speedSkydivingCompetitionSeries/speedSkydivingCompetitionSeries'

type HeaderProps = {
  event: SpeedSkydivingCompetitionSeries
}

const Header = ({ event }: HeaderProps): JSX.Element => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.eventName}>{event.name}</h2>
      </div>
    </div>
  )
}

export default Header
