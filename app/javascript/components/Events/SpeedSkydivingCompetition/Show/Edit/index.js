import React from 'react'
import { useHistory } from 'react-router-dom'
import PropTypes from 'prop-types'

import {
  useEditSpeedSkydivingCompetitionMutation,
  useSpeedSkydivingCompetitionQuery
} from 'api/hooks/speedSkydivingCompetitions'
import Form from 'components/Events/SpeedSkydivingCompetition/Form'
import styles from './styles.module.scss'

const Edit = ({ match }) => {
  const eventId = Number(match.params.eventId)
  const history = useHistory()
  const { data: event } = useSpeedSkydivingCompetitionQuery(eventId)
  const editMutation = useEditSpeedSkydivingCompetitionMutation(eventId, {
    onSuccess: () => history.push(`/events/speed_skydiving/${event.id}`)
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

Edit.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      eventId: PropTypes.string.isRequired
    }).isRequired
  }).isRequired
}

export default Edit
