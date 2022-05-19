import React, { useState } from 'react'

import PlusIcon from 'icons/plus.svg'
import TeamForm from 'components/TeamForm'
import styles from './styles.module.scss'
import { useCreateTeamMutation } from 'api/performanceCompetitions'
import { useCompetitorsQuery } from 'api/performanceCompetitions'

type ActionsBarProps = {
  eventId: number
}

const ActionsBar = ({ eventId }: ActionsBarProps): JSX.Element => {
  const [teamFormShown, setTeamFormShown] = useState(false)
  const newTeamMutation = useCreateTeamMutation(eventId)

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
          competitorsQuery={useCompetitorsQuery}
          onHide={hideTeamForm}
        />
      )}
    </div>
  )
}

export default ActionsBar
