import React from 'react'

import { PerformanceCompetition } from 'api/performanceCompetitions'
import PlaceLabel from 'components/PlaceLabel'
import Navbar from './Navbar'
import styles from './styles.module.scss'

type PerformanceCompetitionHeaderProps = {
  event: PerformanceCompetition
}

const PerformanceCompetitionHeader = ({ event }: PerformanceCompetitionHeaderProps) => {
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

export default PerformanceCompetitionHeader
