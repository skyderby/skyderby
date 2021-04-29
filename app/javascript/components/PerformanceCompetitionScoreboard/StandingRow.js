import React from 'react'
import PropTypes from 'prop-types'

import { useProfileQuery } from 'api/hooks/profiles'
import { useCountryQuery } from 'api/hooks/countries'
import styles from './styles.module.scss'

const formatedResult = (record, task) => {
  if (!record) return

  const result = Number(record.result)
  return result.toFixed(task === 'distance' ? 0 : 1)
}

const formatedPoints = record => {
  if (!record) return

  const score = Number(record.points)
  return score.toFixed(1)
}

const StandingRow = ({ row, competitor, roundsByTask }) => {
  const { data: profile } = useProfileQuery(competitor.profileId)
  const { data: country } = useCountryQuery(profile?.countryId)

  return (
    <tr>
      <td>{row.rank}</td>
      <td>{profile?.name}</td>
      <td>{country?.code}</td>

      {roundsByTask.map(([task, rounds]) => (
        <React.Fragment key={task}>
          {rounds.map(round => (
            <React.Fragment key={round.slug}>
              <td className={styles.roundResult}>
                {formatedResult(row.roundResults[round.slug], task)}
              </td>
              <td className={styles.roundScore}>
                {formatedPoints(row.roundResults[round.slug])}
              </td>
            </React.Fragment>
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

StandingRow.propTypes = {
  roundsByTask: PropTypes.arrayOf(PropTypes.array).isRequired,
  row: PropTypes.shape({
    rank: PropTypes.number.isRequired,
    roundResults: PropTypes.object,
    pointsInDisciplines: PropTypes.object,
    totalPoints: PropTypes.number
  }).isRequired,
  competitor: PropTypes.shape({
    profileId: PropTypes.number
  })
}

export default StandingRow
