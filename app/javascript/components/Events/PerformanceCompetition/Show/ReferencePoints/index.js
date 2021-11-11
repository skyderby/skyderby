import React from 'react'
import PropTypes from 'prop-types'

import styles from './styles.module.scss'
import { useReferencePointsQuery } from 'api/performanceCompetitions'

const ReferencePoints = ({ eventId }) => {
  const { data: items = [] } = useReferencePointsQuery(eventId)

  return (
    <div className={styles.container}>
      <main>
        <ul>
          {items.map(point => (
            <li key={point.id}>
              {point.name}, {point.latitude}, {point.longitude}
            </li>
          ))}
        </ul>
      </main>

      <aside></aside>
    </div>
  )
}

ReferencePoints.propTypes = {
  eventId: PropTypes.number.isRequired
}

export default ReferencePoints
