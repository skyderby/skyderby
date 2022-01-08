import React, { useState } from 'react'
import toast from 'react-hot-toast'

import {
  useCompetitorQuery,
  useDeleteCompetitorMutation,
  useEditCompetitorMutation
} from 'api/speedSkydivingCompetitions'
import { SpeedSkydivingCompetition } from 'api/speedSkydivingCompetitions/types'
import { useProfileQuery } from 'api/profiles'
import { useCountryQuery } from 'api/countries'
import RequestErrorToast from 'components/RequestErrorToast'
import PencilIcon from 'icons/pencil'
import TimesIcon from 'icons/times'
import CompetitorForm from '../CompetitorForm'
import styles from './styles.module.scss'

type CompetitorCellsProps = {
  event: SpeedSkydivingCompetition
  competitorId: number
}

const CompetitorCells = ({ event, competitorId }: CompetitorCellsProps): JSX.Element => {
  const [competitorFormShown, setCompetitorFormShown] = useState(false)
  const { data: competitor } = useCompetitorQuery(event.id, competitorId)
  const { data: profile } = useProfileQuery(competitor?.profileId, { enabled: false })
  const { data: country } = useCountryQuery(profile?.countryId, { enabled: false })

  const editMutation = useEditCompetitorMutation(event.id, competitorId)
  const deleteMutation = useDeleteCompetitorMutation(event.id, competitorId)

  const handleDelete = () =>
    deleteMutation.mutate(undefined, {
      onError: error => {
        toast.error(<RequestErrorToast response={error.response} />)
      }
    })

  return (
    <>
      <td className={styles.competitorCell}>
        <span>{profile?.name}</span>
        {competitor?.assignedNumber && (
          <span className={styles.assignedNumber}>#{competitor.assignedNumber}</span>
        )}
        {event.permissions.canEdit && (
          <div className={styles.actions}>
            <button
              className={styles.actionButton}
              onClick={() => setCompetitorFormShown(true)}
            >
              <PencilIcon />
            </button>
            <button className={styles.actionButton} onClick={handleDelete}>
              <TimesIcon />
            </button>
          </div>
        )}
      </td>
      <td>{country?.code}</td>

      {competitorFormShown && (
        <CompetitorForm
          eventId={event.id}
          initialValues={competitor}
          mutation={editMutation}
          onHide={() => setCompetitorFormShown(false)}
        />
      )}
    </>
  )
}

export default CompetitorCells
