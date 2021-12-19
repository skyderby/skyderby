import React from 'react'

import {
  SpeedSkydivingCompetition,
  useResultsQuery,
  Round,
  CompetitorStandingRow
} from 'api/speedSkydivingCompetitions'
import CompetitorCells from './CompetitorCells'
import ResultCell from './ResultCell'
import styles from './styles.module.scss'

type StandingRowProps = {
  event: SpeedSkydivingCompetition
  row: CompetitorStandingRow
  rounds: Round[]
}

const StandingRow = ({ event, row, rounds }: StandingRowProps): JSX.Element => {
  const { data: results = [] } = useResultsQuery(event.id, {
    select: data => data.filter(result => result.competitorId === row.competitorId)
  })

  const atLeastOneRoundComplete = rounds.find(round => round.completed) !== undefined

  return (
    <tr className={styles.standingRow}>
      <td>{row.rank}</td>
      <CompetitorCells event={event} competitorId={row.competitorId} />
      {rounds.map(round => (
        <ResultCell
          key={round.id}
          event={event}
          roundId={round.id}
          competitorId={row.competitorId}
          result={results.find(result => result.roundId === round.id)}
        />
      ))}
      <td>{atLeastOneRoundComplete ? row.total.toFixed(2) : ''}</td>
      <td>{atLeastOneRoundComplete ? row.average.toFixed(2) : ''}</td>
    </tr>
  )
}

export default StandingRow
