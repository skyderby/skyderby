import React from 'react'
import format from 'date-fns/format'
import { useHistory } from 'react-router-dom'

import { useNewPerformanceEventMutation } from 'api/hooks/performanceCompetitions'
import AppShell from 'components/AppShell'
import Form from 'components/Events/PerformanceCompetition/Form'
import styles from './styles.module.scss'

const NewEvent = () => {
  const newEventMutation = useNewPerformanceEventMutation()
  const history = useHistory()

  const createEvent = async values => {
    try {
      const { data: event } = await newEventMutation.mutateAsync(values)
      history.push(`/events/performance/${event.id}`)
    } catch (err) {
      console.warn(err)
    }
  }

  const initialValues = {
    name: '',
    startsAt: format(new Date(), 'yyyy-MM-dd'),
    rangeFrom: 2500,
    rangeTo: 1500,
    placeId: null,
    visibility: 'public_event',
    useTeams: 'false'
  }

  return (
    <AppShell>
      <div className={styles.container}>
        <h1 className={styles.pageTitle}>New GPS Performance Competition</h1>
        <div className={styles.card}>
          <Form initialValues={initialValues} onSubmit={createEvent} />
        </div>
      </div>
    </AppShell>
  )
}

export default NewEvent
