import React from 'react'

import {
  useResultsQuery,
  PerformanceCompetition,
  Round,
  StandingRow as StandingRowType
} from 'api/performanceCompetitions'
import CompetitorCells from './CompetitorCells'
import styles from './styles.module.scss'
import ResultCells from './ResultCells'

type StandingRowProps = {
  event: PerformanceCompetition
  row: StandingRowType
  roundsByTask: [Round['task'], Round[]][]
}

const StandingRow = ({ event, row, roundsByTask }: StandingRowProps) => {
  const { data: results = [] } = useResultsQuery(event.id, {
    select: data => data.filter(result => result.competitorId === row.competitorId)
  })

  return (
    <tr className={styles.standingRow}>
      <td>{row.rank}</td>
      <CompetitorCells event={event} competitorId={row.competitorId} />

      {roundsByTask.map(([task, rounds]) => (
        <React.Fragment key={task}>
          {rounds.map(round => (
            <ResultCells
              key={round.slug}
              event={event}
              round={round}
              result={results.find(
                result => result.id === row.roundResults[round.slug]?.id
              )}
              points={row.roundResults[round.slug]?.points}
            />
          ))}
          <td className={styles.taskScore}>
            {row.pointsInDisciplines[task]?.toFixed(1)}
          </td>
        </React.Fragment>
      ))}

      <td className={styles.totalScore}>{row.totalPoints?.toFixed(1)}</td>
    </tr>
  )
}

export default StandingRow
