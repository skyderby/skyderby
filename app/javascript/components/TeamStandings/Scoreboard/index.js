import React from 'react'
import PropTypes from 'prop-types'

import Team from './Team'
import styles from './styles.module.scss'

const Scoreboard = ({ rankedTeams }) => {
  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th>#</th>
          <th>Team</th>
          <th>Total points</th>
        </tr>
      </thead>
      <tbody>
        {rankedTeams.map((team, idx) => (
          <tr key={team.id}>
            <td>{idx + 1}</td>
            <td>
              <Team {...team} />
            </td>
            <td>{team.points.toFixed(1)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

Scoreboard.propTypes = {
  rankedTeams: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      points: PropTypes.number
    })
  ).isRequired
}

export default Scoreboard
