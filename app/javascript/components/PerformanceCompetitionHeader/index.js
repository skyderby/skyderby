import React from 'react'
import PropTypes from 'prop-types'

import styles from './styles.module.scss'
import EventPlace from './EventPlace'

const PerformanceCompetitionHeader = ({ event }) => {
  if (!event) return null

  return (
    <div className={styles.container}>
      <h2 className={styles.eventName}>{event.name}</h2>
      <EventPlace placeId={event.placeId} />
    </div>
  )
}

PerformanceCompetitionHeader.propTypes = {
  event: PropTypes.shape({
    name: PropTypes.string.isRequired,
    placeId: PropTypes.number.isRequired
  })
}

export default PerformanceCompetitionHeader
