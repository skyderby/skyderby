import React from 'react'
import { FormikHelpers } from 'formik'
import format from 'date-fns/format'

import {
  useCreatePerformanceCompetitionMutation,
  PerformanceCompetitionVariables
} from 'api/performanceCompetitions'
import Form from '../Form'
import styles from './styles.module.scss'
import { EventVisibility } from 'api/events'
import toast from 'react-hot-toast'
import RequestErrorToast from 'components/RequestErrorToast'

const initialValues = {
  name: '',
  startsAt: format(new Date(), 'yyyy-MM-dd'),
  rangeFrom: 2500,
  rangeTo: 1500,
  placeId: null,
  visibility: 'public_event' as const,
  useTeams: 'false' as const
}

const NewEvent = () => {
  const newEventMutation = useCreatePerformanceCompetitionMutation()

  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>New GPS Performance Competition</h1>
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
