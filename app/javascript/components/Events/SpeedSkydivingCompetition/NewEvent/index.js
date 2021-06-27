import React from 'react'
import format from 'date-fns/format'
import { useHistory } from 'react-router-dom'

import AppShell from 'components/AppShell'
import Form from '../Form'
import styles from './styles.module.scss'

const NewEvent = () => {
  const history = useHistory()

  const createEvent = async values => console.log(values, history)

  const initialValues = {
    name: '',
    startsAt: format(new Date(), 'yyyy-MM-dd'),
    placeId: null,
    visibility: 'public_event',
    useTeams: 'false'
  }

  return (
    <AppShell>
      <div className={styles.container}>
        <h1 className={styles.pageTitle}>New Speed Skydiving Competition</h1>
        <div className={styles.card}>
          <Form initialValues={initialValues} onSubmit={createEvent} />
        </div>
      </div>
    </AppShell>
  )
}

export default NewEvent
