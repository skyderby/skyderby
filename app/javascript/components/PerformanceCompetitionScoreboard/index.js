import React from 'react'
import { useQuery } from 'react-query'
import PropTypes from 'prop-types'

import Api from 'api'
import TableHeader from './TableHeader'
import TableBody from './TableBody'
import styles from './styles.module.scss'
import useCompetitorsQuery from './useCompetitorsQuery'
import useCategoriesQuery from './useCategoriesQuery'
import useRoundsQuery from './useRoundsQuery'

const groupByTask = rounds => {
  const tasks = Array.from(new Set(rounds.map(el => el.task)))

  return tasks.map(task => [task, rounds.filter(el => el.task === task)])
}

const PerformanceCompetitionScoreboard = ({ eventId }) => {
  const { rounds, isLoading: isRoundsLoading } = useRoundsQuery(eventId)
  const { categories, isLoading: isCategoriesLoading } = useCategoriesQuery(eventId)
  const { data: competitors = [], isLoading: isCompetitorsLoading } = useCompetitorsQuery(
    eventId
  )

  const {
    data: standings = [],
    isLoading: isStandingsLoading
  } = useQuery(`performanceCompetitions/${eventId}/standings`, () =>
    Api.PerformanceCompetitions.Standings.findAll(eventId)
  )

  const isLoading =
    isRoundsLoading || isCategoriesLoading || isCompetitorsLoading || isStandingsLoading

  if (isLoading) return null

  const roundsByTask = groupByTask(rounds)

  return (
    <div className={styles.container}>
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

PerformanceCompetitionScoreboard.propTypes = {
  eventId: PropTypes.number.isRequired
}

export default PerformanceCompetitionScoreboard
