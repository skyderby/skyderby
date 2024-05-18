import React from 'react'

import {
  usePerformanceCompetitionSuspenseQuery,
  useUpdatePerformanceCompetitionMutation
} from 'api/performanceCompetitions'
import Form from 'components/Events/SpeedSkydivingCompetition/Form'
import styles from './styles.module.scss'
import { useI18n } from 'components/TranslationsProvider'
import ErrorPage from 'components/ErrorPage'

type EditProps = {
  eventId: number
}

const Edit = ({ eventId }: EditProps) => {
  const { formatDate } = useI18n()
  const { data: event } = usePerformanceCompetitionSuspenseQuery(eventId)
  const editMutation = useUpdatePerformanceCompetitionMutation(eventId)

  if (!event.permissions.canEdit) return <ErrorPage.Forbidden />

  const initialValues = {
    ...event,
    startsAt: formatDate(event.startsAt, 'yyyy-MM-dd'),
    useTeams: event.useTeams ? ('true' as const) : ('false' as const)
  }

  return (
    <div className={styles.container}>
      <Form
        initialValues={initialValues}
        mutation={editMutation}
        returnUrl={`/events/performance/${eventId}`}
      />
    </div>
  )
}

export default Edit
