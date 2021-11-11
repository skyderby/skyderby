import React, { useState } from 'react'
import PropTypes from 'prop-types'

import {
  useCompetitorQuery,
  useDeleteCompetitorMutation,
  useEditCompetitorMutation
} from 'api/speedSkydivingCompetitions'
import { useProfileQuery } from 'api/profiles'
import { useCountryQuery } from 'api/countries'
import PencilIcon from 'icons/pencil'
import TimesIcon from 'icons/times'
import CompetitorForm from '../CompetitorForm'
import styles from './styles.module.scss'
import { SpeedSkydivingCompetition } from 'api/speedSkydivingCompetitions/types'

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
            <button
              className={styles.actionButton}
              onClick={() => deleteMutation.mutate(undefined)}
            >
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

CompetitorCells.propTypes = {
  event: PropTypes.shape({
    id: PropTypes.number.isRequired,
    permissions: PropTypes.shape({
      canEdit: PropTypes.bool.isRequired
    }).isRequired
  }).isRequired,
  competitorId: PropTypes.number.isRequired
}

export default CompetitorCells
