import React from 'react'
import { NavLink } from 'react-router-dom'
import PropTypes from 'prop-types'

import { useI18n } from 'components/TranslationsProvider'
import styles from './styles.module.scss'

const mapsPath = (eventId, roundId) => `/events/performance/${eventId}/maps/${roundId}`

const RoundsBar = ({ eventId, rounds }) => {
  const { t } = useI18n()

  return (
    <div className={styles.container}>
      {rounds.map(round => (
        <NavLink
          key={round.id}
          to={mapsPath(eventId, round.id)}
          className={styles.button}
        >
          {t(`disciplines.${round.task}`)} - {round.number}
        </NavLink>
      ))}
    </div>
  )
}

RoundsBar.propTypes = {
  eventId: PropTypes.number.isRequired,
  rounds: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      task: PropTypes.oneOf(['distance', 'speed', 'time']).isRequired,
      number: PropTypes.number.isRequired
    })
  ).isRequired
}

export default RoundsBar
