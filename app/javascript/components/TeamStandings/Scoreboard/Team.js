import React, { useState } from 'react'
import PropTypes from 'prop-types'

import { usePageContext } from 'components/PageContext'
import FlatButton from 'components/ui/FlatButton'
import EditTeamModal from 'components/TeamStandings/EditTeamModal'

import { TeamDetails, TeamName } from './elements'

const Team = ({ id, name, competitors }) => {
  const [isEditing, setIsEditing] = useState(false)
  const { editable } = usePageContext()

  const sortedCompetitors = competitors.sort(el => -el.total_points)

  return (
    <TeamDetails>
      <TeamName>
        <span>{name}</span>
        {editable && (
          <>
            <FlatButton onClick={() => setIsEditing(true)}>Edit</FlatButton>
            <EditTeamModal
              id={id}
              isShown={isEditing}
              onHide={() => setIsEditing(false)}
            />
          </>
        )}
      </TeamName>
      <ul>
        {sortedCompetitors.map(competitor => (
          <li key={competitor.id}>
            {competitor.name} - {competitor.total_points.toFixed(1)}
          </li>
        ))}
      </ul>
    </TeamDetails>
  )
}

Team.propTypes = {
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  competitors: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      total_points: PropTypes.number.isRequired
    })
  )
}

export default Team
