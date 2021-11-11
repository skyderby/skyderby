import React, { useState } from 'react'
import PropTypes from 'prop-types'

import {
  useCompetitorQuery,
  useDeleteCompetitorMutation,
  useEditCompetitorMutation
} from 'api/performanceCompetitions'
import { useProfileQuery } from 'api/profiles'
import { useCountryQuery } from 'api/countries'
import PencilIcon from 'icons/pencil'
import TimesIcon from 'icons/times'
import CompetitorForm from '../CompetitorForm'
import styles from './styles.module.scss'
import SuitLabel from 'components/SuitLabel'
import { useSuitQuery } from 'api/suits'
import { useManufacturerQuery } from 'api/manufacturer'

const CompetitorCells = ({ event, competitorId }) => {
  const [competitorFormShown, setCompetitorFormShown] = useState(false)
  const { data: competitor } = useCompetitorQuery(event.id, competitorId)
  const { data: profile } = useProfileQuery(competitor?.profileId)
  const { data: country } = useCountryQuery(profile?.countryId)
  const { data: suit } = useSuitQuery(competitor?.suitId)
  const { data: make } = useManufacturerQuery(suit?.makeId)

  const editMutation = useEditCompetitorMutation(event.id, {
    onSuccess: () => setCompetitorFormShown(false)
  })

  const deleteMutation = useDeleteCompetitorMutation()
  const deleteCompetitor = () =>
    deleteMutation.mutate({
      eventId: event.id,
      id: competitorId
    })

  return (
    <>
      <td className={styles.competitorCell}>
        <div className={styles.competitorMain}>
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
              <button className={styles.actionButton} onClick={deleteCompetitor}>
                <TimesIcon />
              </button>
            </div>
          )}
        </div>
        <div className={styles.competitorAdditional}>
          <SuitLabel name={suit?.name} code={make?.code} />
        </div>
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
