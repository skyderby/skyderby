import React from 'react'
import PropTypes from 'prop-types'
import {
  useCategoryQuery,
  useCompetitorQuery,
  useResultsQuery
} from 'api/hooks/speedSkydivingCompetitions'
import { useProfileQuery } from 'api/hooks/profiles'
import { useCountryQuery } from 'api/hooks/countries'
import ResultCell from '../Scoreboard/TableBody/ResultCell'
import styles from './styles.module.scss'

const StandingRow = ({ event, rounds, rank, competitorId, total, average }) => {
  const { data: competitor } = useCompetitorQuery(event.id, competitorId)
  const { data: category } = useCategoryQuery(event.id, competitor?.categoryId)
  const { data: profile } = useProfileQuery(competitor?.profileId)
  const { data: country } = useCountryQuery(profile?.countryId)
  const { data: results } = useResultsQuery(event.id, {
    select: data => data.filter(result => result.competitorId === competitorId)
  })

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
      <td>{results.length > 0 && total.toFixed(2)}</td>
      <td>{results.length > 0 && average.toFixed(2)}</td>
    </tr>
  )
}

StandingRow.propTypes = {
  event: PropTypes.shape({
    id: PropTypes.number.isRequired
  }).isRequired,
  rank: PropTypes.number.isRequired,
  competitorId: PropTypes.number.isRequired,
  total: PropTypes.number,
  average: PropTypes.number,
  rounds: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      number: PropTypes.number.isRequired
    })
  ).isRequired
}

export default StandingRow
