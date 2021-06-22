import React from 'react'
import PropTypes from 'prop-types'

import {
  useRoundsQuery,
  useCategoriesQuery,
  useCompetitorsQuery,
  useStandingsQuery
} from 'api/hooks/performanceCompetitions'
import ActionsBar from './ActionsBar'
import TableHeader from './TableHeader'
import TableBody from './TableBody'
import styles from './styles.module.scss'

const groupByTask = rounds => {
  const tasks = Array.from(new Set(rounds.map(el => el.task)))

  return tasks.map(task => [task, rounds.filter(el => el.task === task)])
}

const Scoreboard = ({ eventId }) => {
  const { data: standings, isLoading } = useStandingsQuery(eventId)
  const { data: rounds } = useRoundsQuery(eventId)
  const { data: categories } = useCategoriesQuery(eventId)
  const { data: competitors } = useCompetitorsQuery(eventId)

  if (isLoading) return null

  const roundsByTask = groupByTask(rounds)

  return (
    <div className={styles.container}>
      <ActionsBar />

      <table className={styles.scoreboardTable}>
        <TableHeader roundsByTask={roundsByTask} />
        <TableBody
          roundsByTask={roundsByTask}
          competitors={competitors}
          categories={categories}
          standings={standings}
        />
      </table>
    </div>
  )
}

Scoreboard.propTypes = {
  eventId: PropTypes.number.isRequired
}

export default Scoreboard
