import React from 'react'
import { useNavigate } from 'react-router-dom'

import {
  useEditSpeedSkydivingCompetitionMutation,
  useSpeedSkydivingCompetitionQuery
} from 'api/speedSkydivingCompetitions'
import Form from 'components/Events/SpeedSkydivingCompetition/Form'
import styles from './styles.module.scss'

const Edit = ({ eventId }) => {
  const navigate = useNavigate()
  const { data: event } = useSpeedSkydivingCompetitionQuery(eventId)
  const editMutation = useEditSpeedSkydivingCompetitionMutation(eventId, {
    onSuccess: () => navigate(`/events/speed_skydiving/${event.id}`)
  })

  const initialValues = {
    ...event,
    useTeams: event.useTeams.toString()
  }

  return (
    <div className={styles.container}>
      <Form
        initialValues={initialValues}
        mutation={editMutation}
        returnUrl={`/events/speed_skydiving/${eventId}`}
      />
    </div>
  )
}

export default Edit
