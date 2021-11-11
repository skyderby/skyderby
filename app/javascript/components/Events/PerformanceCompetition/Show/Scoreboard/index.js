import React from 'react'
import PropTypes from 'prop-types'

import {
  useRoundsQuery,
  useCategoriesQuery,
  useCompetitorsQuery,
  useStandingsQuery,
  usePerformanceEventQuery
} from 'api/performanceCompetitions'
import ActionsBar from './ActionsBar'
import TableHeader from './TableHeader'
import TableBody from './TableBody'
import styles from './styles.module.scss'

const groupByTask = rounds => {
  const tasks = Array.from(new Set(rounds.map(el => el.task)))

  return tasks.map(task => [task, rounds.filter(el => el.task === task)])
}

const Scoreboard = ({ match }) => {
  const eventId = Number(match.params.eventId)
  const { data: standings, isLoading } = useStandingsQuery(eventId)
  const { data: rounds } = useRoundsQuery(eventId)
  const { data: categories } = useCategoriesQuery(eventId)
  const { data: competitors } = useCompetitorsQuery(eventId)
  const { data: event } = usePerformanceEventQuery(eventId)

  if (isLoading) return null

  const roundsByTask = groupByTask(rounds)

  return (
    <div className={styles.container}>
      {event.permissions.canEdit && <ActionsBar eventId={eventId} />}

      <div className={styles.tableWrapper}>
        <table className={styles.scoreboardTable}>
          <TableHeader event={event} roundsByTask={roundsByTask} />
          <TableBody
            event={event}
            roundsByTask={roundsByTask}
            competitors={competitors}
            categories={categories}
            standings={standings}
          />
        </table>
      </div>
    </div>
  )
}

Scoreboard.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      eventId: PropTypes.string.isRequired
    }).isRequired
  }).isRequired
}

export default Scoreboard
