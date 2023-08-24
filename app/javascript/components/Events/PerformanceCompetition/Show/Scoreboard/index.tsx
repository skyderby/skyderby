import React from 'react'

import {
  useRoundsQuery,
  useCategoriesQuery,
  useStandingsQuery,
  usePerformanceCompetitionQuery,
  Round
} from 'api/performanceCompetitions'
import ActionsBar from './ActionsBar'
import TableHeader from './TableHeader'
import TableBody from './TableBody'
import styles from './styles.module.scss'

type ScoreboardProps = {
  eventId: number
}

const groupByTask = (rounds: Round[]): [Round['task'], Round[]][] => {
  const tasks = Array.from(new Set(rounds.map(el => el.task)))

  return tasks.map(task => [task, rounds.filter(el => el.task === task)])
}

const Scoreboard = ({ eventId }: ScoreboardProps) => {
  const { data: standings = [], isLoading } = useStandingsQuery(eventId)
  const { data: rounds = [] } = useRoundsQuery(eventId)
  const { data: categories = [] } = useCategoriesQuery(eventId)
  const { data: event } = usePerformanceCompetitionQuery(eventId)

  if (isLoading || !event) return null

  const roundsByTask = groupByTask(rounds)

  return (
    <div className={styles.container}>
      {event.permissions.canEdit && <ActionsBar event={event} />}

      <div className={styles.tableWrapper}>
        <table className={styles.scoreboardTable}>
          <TableHeader event={event} roundsByTask={roundsByTask} />
          <TableBody
            event={event}
            roundsByTask={roundsByTask}
            categories={categories}
            standings={standings}
          />
        </table>
      </div>
    </div>
  )
}

export default Scoreboard
