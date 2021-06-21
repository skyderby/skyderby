import React from 'react'
import PropTypes from 'prop-types'

import styles from './styles.module.scss'
import EventPlace from './EventPlace'
import Navbar from './Navbar'

const PerformanceCompetitionHeader = ({ event }) => {
  if (!event) return null

  return (
    <div className={styles.container}>
      <div>
        <h2 className={styles.eventName}>{event.name}</h2>
        <EventPlace placeId={event.placeId} />
      </div>
      <Navbar event={event} />
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
