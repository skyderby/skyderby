import React from 'react'
import { useNavigate } from 'react-router-dom'

import { useNewSpeedSkydivingCompetitionMutation } from 'api/speedSkydivingCompetitions'
import { useI18n } from 'components/TranslationsProvider'
import Form from '../Form'
import styles from './styles.module.scss'

const NewEvent = () => {
  const navigate = useNavigate()
  const { formatDate } = useI18n()
  const newEventMutation = useNewSpeedSkydivingCompetitionMutation({
    onSuccess: event => navigate(`/events/speed_skydiving/${event.id}`)
  })

  const initialValues = {
    name: '',
    startsAt: formatDate(new Date(), 'yyyy-MM-dd'),
    placeId: null,
    visibility: 'public_event' as const,
    useTeams: 'false' as const
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>New Speed Skydiving Competition</h1>
      <div className={styles.card}>
        <Form
          initialValues={initialValues}
          mutation={newEventMutation}
          returnUrl="/events/new"
        />
      </div>
    </div>
  )
}

export default NewEvent
