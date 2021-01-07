import React, { useState } from 'react'
import PropTypes from 'prop-types'

import { usePageContext } from 'components/PageContext'
import EditTeamModal from 'components/TeamStandings/EditTeamModal'

import styles from './styles.module.scss'

const Team = ({ id, name, competitors }) => {
  const [isEditing, setIsEditing] = useState(false)
  const { editable } = usePageContext()

  const sortedCompetitors = competitors.sort(el => -el.total_points)

  return (
    <div className={styles.teamDetails}>
      <div className={styles.teamName}>
        <span>{name}</span>
        {editable && (
          <>
            <button className={styles.flatButton} onClick={() => setIsEditing(true)}>
              Edit
            </button>
            <EditTeamModal
              id={id}
              isShown={isEditing}
              onHide={() => setIsEditing(false)}
            />
          </>
        )}
      </div>
      <ul>
        {sortedCompetitors.map(competitor => (
          <li key={competitor.id}>
            {competitor.name} - {competitor.total_points.toFixed(1)}
          </li>
        ))}
      </ul>
    </div>
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
