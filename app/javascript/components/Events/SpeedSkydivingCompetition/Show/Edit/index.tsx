import React from 'react'
import { useNavigate } from 'react-router-dom'

import {
  useEditSpeedSkydivingCompetitionMutation,
  useSpeedSkydivingCompetitionQuery
} from 'api/speedSkydivingCompetitions'
import Form from 'components/Events/SpeedSkydivingCompetition/Form'
import styles from './styles.module.scss'
import { useI18n } from 'components/TranslationsProvider'

type EditProps = {
  eventId: number
}

const Edit = ({ eventId }: EditProps): JSX.Element | null => {
  const navigate = useNavigate()
  const { formatDate } = useI18n()
  const { data: event, isLoading } = useSpeedSkydivingCompetitionQuery(eventId)
  const editMutation = useEditSpeedSkydivingCompetitionMutation(eventId, {
    onSuccess: () => navigate(`/events/speed_skydiving/${eventId}`)
  })

  if (isLoading || !event) return null

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
        returnUrl={`/events/speed_skydiving/${eventId}`}
      />
    </div>
  )
}

export default Edit
