import React from 'react'
import PropTypes from 'prop-types'

import { Card, Rank, Details, Points } from './elements'

const Team = ({ rank, name, points, competitors }) => (
  <Card>
    <Rank>{rank}</Rank>
    <Details>
      <div>{name}</div>
      <ul>
        {competitors.map(competitor => (
          <li key={competitor.id}>
            {competitor.name} - {competitor.total_points.toFixed(1)}
          </li>
        ))}
      </ul>
    </Details>
    <Points>{points.toFixed(1)}</Points>
  </Card>
)

Team.propTypes = {
  rank: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  points: PropTypes.number.isRequired,
  competitors: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      total_points: PropTypes.number.isRequired
    })
  )
}

export default Team
