import React from 'react'
import { NavLink } from 'react-router-dom'

import { useI18n } from 'components/TranslationsProvider'
import styles from './styles.module.scss'
import { Round } from 'api/performanceCompetitions'

type RoundsBarProps = {
  eventId: number
  rounds: Round[]
}
const mapsPath = (eventId: number, roundId: number) => `/events/performance/${eventId}/maps/${roundId}`

const RoundsBar = ({ eventId, rounds }: RoundsBarProps) => {
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

export default RoundsBar
