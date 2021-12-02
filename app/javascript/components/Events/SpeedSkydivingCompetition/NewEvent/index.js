import React from 'react'
import format from 'date-fns/format'
import { useNavigate } from 'react-router-dom'

import Form from '../Form'
import styles from './styles.module.scss'
import { useNewSpeedSkydivingCompetitionMutation } from 'api/speedSkydivingCompetitions'

const NewEvent = () => {
  const navigate = useNavigate()
  const newEventMutation = useNewSpeedSkydivingCompetitionMutation({
    onSuccess: event => navigate(`/events/speed_skydiving/${event.id}`)
  })

  const initialValues = {
    name: '',
    startsAt: format(new Date(), 'yyyy-MM-dd'),
    placeId: null,
    visibility: 'public_event',
    useTeams: 'false'
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>New Speed Skydiving Competition</h1>
      <div className={styles.card}>
        <Form
          initialValues={initialValues}
          mutation={newEventMutation}
          returnUrl="/events/speed_skydiving/new"
        />
      </div>
    </div>
  )
}

export default NewEvent
