import React from 'react'
import PropTypes from 'prop-types'

import CompetitorCells from './CompetitorCells'
import styles from './styles.module.scss'

const formattedResult = (record, task) => {
  if (!record) return

  const result = Number(record.result)
  return result.toFixed(task === 'distance' ? 0 : 1)
}

const formattedPoints = record => {
  if (!record) return

  const score = Number(record.points)
  return score.toFixed(1)
}

const StandingRow = ({ event, row, roundsByTask }) => {
  return (
    <tr>
      <td>{row.rank}</td>
      <CompetitorCells event={event} competitorId={row.competitorId} />

      {roundsByTask.map(([task, rounds]) => (
        <React.Fragment key={task}>
          {rounds.map(round => (
            <React.Fragment key={round.slug}>
              {!row.roundResults && console.log(row)}
              <td className={styles.roundResult}>
                {formattedResult(row.roundResults[round.slug], task)}
              </td>
              <td className={styles.roundScore}>
                {formattedPoints(row.roundResults[round.slug])}
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
  event: PropTypes.object.isRequired,
  roundsByTask: PropTypes.arrayOf(PropTypes.array).isRequired,
  row: PropTypes.shape({
    rank: PropTypes.number.isRequired,
    competitorId: PropTypes.number.isRequired,
    roundResults: PropTypes.object,
    pointsInDisciplines: PropTypes.object,
    totalPoints: PropTypes.number
  }).isRequired,
  competitor: PropTypes.shape({
    profileId: PropTypes.number
  })
}

export default StandingRow
