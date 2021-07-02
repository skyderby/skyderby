import React from 'react'
import PropTypes from 'prop-types'

import {
  useCompetitorQuery,
  useDeleteCompetitorMutation
} from 'api/hooks/speedSkydivingCompetitions'
import { useProfileQuery } from 'api/hooks/profiles'
import { useCountryQuery } from 'api/hooks/countries'
import PencilIcon from 'icons/pencil'
import TimesIcon from 'icons/times'
import styles from './styles.module.scss'

const CompetitorCells = ({ event, competitorId }) => {
  const { data: competitor } = useCompetitorQuery(event.id, competitorId)
  const { data: profile } = useProfileQuery(competitor?.profileId)
  const { data: country } = useCountryQuery(profile?.countryId)

  const deleteMutation = useDeleteCompetitorMutation()
  const deleteCompetitor = () =>
    deleteMutation.mutate({
      eventId: event.id,
      id: competitorId
    })

  return (
    <>
      <td className={styles.competitorCell}>
        <span>{profile?.name}</span>
        {competitor?.assignedNumber && <span>`#${competitor.assignedNumber}`</span>}
        {event.permissions.canEdit && (
          <>
            <button className={styles.actionButton}>
              <PencilIcon />
            </button>
            <button className={styles.actionButton} onClick={deleteCompetitor}>
              <TimesIcon />
            </button>
          </>
        )}
      </td>
      <td>{country?.code}</td>
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
