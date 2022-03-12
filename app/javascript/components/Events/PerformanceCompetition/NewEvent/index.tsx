import React from 'react'
import format from 'date-fns/format'
import { useNavigate } from 'react-router-dom'

import { useCreatePerformanceCompetitionMutation } from 'api/performanceCompetitions'
import Form from '../Form'
import styles from './styles.module.scss'
import { EventVisibility } from 'api/events'
import toast from 'react-hot-toast'
import RequestErrorToast from 'components/RequestErrorToast'
import { FormikHelpers } from 'formik'

const initialValues = {
  name: '',
  startsAt: format(new Date(), 'yyyy-MM-dd'),
  rangeFrom: 2500,
  rangeTo: 1500,
  placeId: null,
  visibility: 'public_event',
  useTeams: 'false'
}

type FormData = {
  name: string
  startsAt: string
  rangeFrom: number
  rangeTo: number
  placeId: number | null
  visibility: EventVisibility
  useTeams: 'true' | 'false'
}

const NewEvent = () => {
  const newEventMutation = useCreatePerformanceCompetitionMutation()
  const navigate = useNavigate()

  const createEvent = (values: FormData, formikBag: FormikHelpers<FormData>) => {
    newEventMutation.mutate(values, {
      onSuccess: console.log,
      onSettled: () => formikBag.setSubmitting(false),
      onError: error => {
        toast.error(<RequestErrorToast response={error.response} />)
      }
    })
    // navigate(`/events/performance/${event.id}`)
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>New GPS Performance Competition</h1>
      <div className={styles.card}>
        <Form initialValues={initialValues} onSubmit={createEvent} />
      </div>
    </div>
  )
}

export default NewEvent
