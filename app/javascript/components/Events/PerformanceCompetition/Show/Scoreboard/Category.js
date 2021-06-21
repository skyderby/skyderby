import React from 'react'
import PropTypes from 'prop-types'

import StandingRow from './StandingRow'

const categoryColSpan = roundsByTask =>
  roundsByTask.length + roundsByTask.map(([_task, rounds]) => rounds).flat().length + 5

const Category = ({ category, standings, roundsByTask, competitors }) => {
  const competitorsById = Object.fromEntries(competitors.map(el => [el.id, el]))

  return (
    <tbody>
      <tr>
        <td colSpan={categoryColSpan(roundsByTask)}>{category.name}</td>
      </tr>
      {standings.map(row => (
        <StandingRow
          key={row.competitorId}
          row={row}
          competitor={competitorsById[row.competitorId]}
          roundsByTask={roundsByTask}
        />
      ))}
    </tbody>
  )
}

Category.propTypes = {
  category: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired
  }).isRequired,
  standings: PropTypes.arrayOf(
    PropTypes.shape({
      rank: PropTypes.number,
      competitorId: PropTypes.number
    })
  ),
  roundsByTask: PropTypes.arrayOf(PropTypes.array),
  competitors: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      profile: PropTypes.shape({
        name: PropTypes.string.isRequired
      })
    })
  )
}

export default Category
