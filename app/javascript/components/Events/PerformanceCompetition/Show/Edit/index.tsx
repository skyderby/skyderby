import React from 'react'
import { useNavigate } from 'react-router-dom'

import {
  usePerformanceCompetitionQuery,
  useUpdatePerformanceCompetitionMutation
} from 'api/performanceCompetitions'
import Form from 'components/Events/SpeedSkydivingCompetition/Form'
import styles from './styles.module.scss'
import { useI18n } from 'components/TranslationsProvider'
import ErrorPage from 'components/ErrorPage'

type EditProps = {
  eventId: number
}

const Edit = ({ eventId }: EditProps): JSX.Element | null => {
  const navigate = useNavigate()
  const { formatDate } = useI18n()
  const { data: event, isLoading } = usePerformanceCompetitionQuery(eventId)
  const editMutation = useUpdatePerformanceCompetitionMutation(eventId)

  if (isLoading || !event) return null

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
