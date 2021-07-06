import React, { useState } from 'react'
import PropTypes from 'prop-types'

import PlusIcon from 'icons/plus.svg'
import TeamForm from '../TeamForm'
import styles from './styles.module.scss'
import { useNewTeamMutation } from 'api/hooks/speedSkydivingCompetitions'

const ActionsBar = ({ eventId }) => {
  const [teamFormShown, setTeamFormShown] = useState(false)
  const newTeamMutation = useNewTeamMutation()

  const showTeamForm = () => setTeamFormShown(true)
  const hideTeamForm = () => setTeamFormShown(false)

  return (
    <div className={styles.container}>
      <button className={styles.button} onClick={showTeamForm}>
        <PlusIcon /> &nbsp; Team
      </button>

      {teamFormShown && (
        <TeamForm
          title="New team"
          eventId={eventId}
          mutation={newTeamMutation}
          onHide={hideTeamForm}
        />
      )}
    </div>
  )
}

ActionsBar.propTypes = {
  eventId: PropTypes.number.isRequired
}

export default ActionsBar
