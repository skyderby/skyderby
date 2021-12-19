import React from 'react'
import {
  useCategoryQuery,
  useCompetitorQuery,
  useResultsQuery
} from 'api/speedSkydivingCompetitions'
import { useProfileQuery } from 'api/profiles'
import { useCountryQuery } from 'api/countries'
import ResultCell from '../Scoreboard/TableBody/ResultCell'
import styles from './styles.module.scss'
import type { Round, SpeedSkydivingCompetition } from 'api/speedSkydivingCompetitions'

type StandingRowProps = {
  event: SpeedSkydivingCompetition
  rounds: Round[]
  rank: number
  competitorId: number
  total: number
  average: number
}

const StandingRow = ({
  event,
  rounds,
  rank,
  competitorId,
  total,
  average
}: StandingRowProps): JSX.Element => {
  const { data: competitor } = useCompetitorQuery(event.id, competitorId)
  const { data: category } = useCategoryQuery(event.id, competitor?.categoryId)
  const { data: profile } = useProfileQuery(competitor?.profileId)
  const { data: country } = useCountryQuery(profile?.countryId)
  const { data: results = [] } = useResultsQuery(event.id, {
    select: data => data.filter(result => result.competitorId === competitorId)
  })

  const atLeastOneRoundComplete = rounds.find(round => round.completed) !== undefined

  return (
    <tr>
      <td>{rank}</td>
      <td className={styles.competitorCell}>
        <span>{profile?.name}</span>
        {competitor?.assignedNumber && (
          <span className={styles.assignedNumber}>#{competitor.assignedNumber}</span>
        )}
        &nbsp; // &nbsp;
        <span className={styles.category}>{category?.name}</span>
      </td>
      <td>{country?.code}</td>
      {rounds.map(round => (
        <ResultCell
          key={round.id}
          className={styles.resultCell}
          event={event}
          roundId={round.id}
          competitorId={competitorId}
          result={results.find(result => result.roundId === round.id)}
        />
      ))}
      <td>{atLeastOneRoundComplete ? total.toFixed(2) : ''}</td>
      <td>{atLeastOneRoundComplete ? average.toFixed(2) : ''}</td>
    </tr>
  )
}

export default StandingRow
